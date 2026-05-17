<script lang="ts">
    import ContinentPanel from './ContinentPanel.svelte';
    import { gameState } from '../lib/stores/gameStore.svelte';
    import { mapRenderer } from '../lib/stores/mapStore.svelte';

    let canvas: HTMLCanvasElement;
    let wrapperWidth = $state(0);

    $effect(() => {
        if (!canvas || wrapperWidth === 0) return;
        mapRenderer.init(canvas, wrapperWidth);
    });

    // ─── Input source tracking ────────────────────────────────────────────────
    // Prevents synthesized mouse events from firing after touch interactions
    let lastInputWasTouch = false;
    let touchEndTimer: ReturnType<typeof setTimeout> | null = null;

    function markTouchInput() {
        lastInputWasTouch = true;
        if (touchEndTimer) clearTimeout(touchEndTimer);
        // Browsers fire synthesized mouse events ~300ms after touch
        touchEndTimer = setTimeout(() => { lastInputWasTouch = false; }, 500);
    }

    // ─── DESKTOP MOUSE ────────────────────────────────────────────────────────

    function handleMouseDown(e: MouseEvent) {
        if (lastInputWasTouch) return;
        mapRenderer.dragStart(e.clientX, e.clientY);
    }

    function handleMouseMove(e: MouseEvent) {
        if (lastInputWasTouch) return;
        mapRenderer.dragMove(e.clientX, e.clientY);
        mapRenderer.handleMouseMove(e.clientX, e.clientY, canvas.getBoundingClientRect());
    }

    function handleMouseUp() {
        if (lastInputWasTouch) return;
        mapRenderer.dragEnd();
    }

    function handleWheel(e: WheelEvent) {
        e.preventDefault();
        mapRenderer.zoom(e.clientX, e.clientY, canvas.getBoundingClientRect(), e.deltaY);
    }

    // ─── MOBILE TOUCH ─────────────────────────────────────────────────────────

    // Gesture state machine
    type TouchGesture = 'idle' | 'drag' | 'pinch' | 'double-tap-zoom';
    let gesture: TouchGesture = $state('idle');

    // Pinch state
    let pinchStartDistance = 0;

    // Double-tap-zoom state
    let tapZoomAnchor = { x: 0, y: 0 };
    let tapZoomStartY = 0;

    // Double-tap detection
    let lastTapTime = 0;
    let lastTapPos = { x: 0, y: 0 };
    const DOUBLE_TAP_DELAY = 300;
    const DOUBLE_TAP_SLOP = 40; // max px between taps to count as double-tap

    function getTouchMidpoint(touches: TouchList) {
        const t1 = touches[0], t2 = touches[1];
        return {
            x: (t1.clientX + t2.clientX) / 2,
            y: (t1.clientY + t2.clientY) / 2,
            distance: Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
        };
    }

    function handleTouchStart(e: TouchEvent) {
        markTouchInput();

        if (e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            const now = Date.now();

            const timeSinceLastTap = now - lastTapTime;
            const distSinceLastTap = Math.hypot(
                touch.clientX - lastTapPos.x,
                touch.clientY - lastTapPos.y
            );
            const isDoubleTap =
                timeSinceLastTap < DOUBLE_TAP_DELAY &&
                distSinceLastTap < DOUBLE_TAP_SLOP;

            if (isDoubleTap && gesture === 'idle') {
                // Start double-tap zoom — anchor to the tap position
                gesture = 'double-tap-zoom';
                tapZoomAnchor = { x: touch.clientX, y: touch.clientY };
                tapZoomStartY = touch.clientY;
                lastTapTime = 0; // Consume the double tap
            } else {
                // Regular drag
                gesture = 'drag';
                mapRenderer.dragStart(touch.clientX, touch.clientY);
                lastTapTime = now;
                lastTapPos = { x: touch.clientX, y: touch.clientY };
            }

        } else if (e.touches.length === 2) {
            e.preventDefault();
            // Cancel whatever was happening with one finger
            if (gesture === 'drag') mapRenderer.dragEnd();
            gesture = 'pinch';
            lastTapTime = 0; // Prevent double-tap misfire after pinch
            const mid = getTouchMidpoint(e.touches);
            pinchStartDistance = mid.distance;
        }
    }

    function handleTouchMove(e: TouchEvent) {
        if (e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];

            if (gesture === 'double-tap-zoom') {
                const dy = touch.clientY - tapZoomStartY;
                // Drag DOWN = zoom in, drag UP = zoom out
                mapRenderer.zoom(
                    tapZoomAnchor.x,
                    tapZoomAnchor.y,
                    canvas.getBoundingClientRect(),
                    -dy * 10
                );
                tapZoomStartY = touch.clientY;

            } else if (gesture === 'drag') {
                mapRenderer.dragMove(touch.clientX, touch.clientY);
                mapRenderer.handleMouseMove(touch.clientX, touch.clientY, canvas.getBoundingClientRect());
            }

        } else if (e.touches.length === 2 && gesture === 'pinch') {
            e.preventDefault();
            const mid = getTouchMidpoint(e.touches);
            // Fingers spreading apart (distance increasing) = zoom in = negative deltaY
            const delta = (pinchStartDistance - mid.distance) * 2;
            mapRenderer.zoom(mid.x, mid.y, canvas.getBoundingClientRect(), delta);
            pinchStartDistance = mid.distance;
        }
    }

    function handleTouchEnd(e: TouchEvent) {
        markTouchInput();

        if (e.touches.length === 0) {
            // All fingers lifted
            if (gesture === 'drag') mapRenderer.dragEnd();
            gesture = 'idle';
            pinchStartDistance = 0;

        } else if (e.touches.length === 1 && gesture === 'pinch') {
            // One finger lifted from pinch — transition to drag without
            // updating lastTapTime (prevents accidental double-tap)
            gesture = 'drag';
            pinchStartDistance = 0;
            const touch = e.touches[0];
            mapRenderer.dragStart(touch.clientX, touch.clientY);
        }
    }
</script>

<svelte:window
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
/>

<div class="main-layout">
    <div bind:clientWidth={wrapperWidth} class="canvas-wrap">
        <canvas
            bind:this={canvas}
            class:dragging={mapRenderer.isDragging || gesture === 'double-tap-zoom'}
            onmousedown={handleMouseDown}
            onwheel={handleWheel}
            onmouseleave={mapRenderer.handleMouseLeave}
            ontouchstart={handleTouchStart}
        ></canvas>

        {#if gameState.loading || !mapRenderer.ready}
            <div id="loading">loading map...</div>
        {/if}
    </div>

    <div id="canvas-footer">
        <div class="hint">
            scroll to zoom &nbsp;·&nbsp; drag to pan
        </div>
        <div class="hint country-display">
            {mapRenderer.hoveredCountry ?? ''}
        </div>
    </div>

    <ContinentPanel />
</div>

<style>
    canvas {
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
    }
    .main-layout {
        width: 100%;
        max-width: 1200px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .canvas-wrap {
        position: relative;
        border: 1px solid var(--border);
        border-radius: 10px;
        overflow: hidden;
        background: var(--bg);
    }

    canvas {
        display: block;
        width: 100%;
        cursor: grab;
    }

    canvas.dragging {
        cursor: grabbing;
    }

    #loading {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-display);
        font-size: 0.75rem;
        color: var(--muted);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        background: var(--bg);
    }

    #canvas-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .hint {
        margin-bottom: 7px;
        font-size: 0.7rem;
        color: var(--muted);
    }

    .country-display {
        font-weight: 600;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
</style>
