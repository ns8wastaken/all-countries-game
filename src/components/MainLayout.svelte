<script lang="ts">
    import ContinentPanel from './ContinentPanel.svelte';
    import { gameState } from '../lib/stores/gameStore.svelte';
    import { mapRenderer } from '../lib/stores/mapStore.svelte';

    let canvas: HTMLCanvasElement;
    let wrapperWidth = $state(0);

    // Update when wrapperWidth changes
    $effect(() => {
        if (!canvas || wrapperWidth === 0) return;
        mapRenderer.init(canvas, wrapperWidth);
    });

    // Handle zoom
    function handleWheel(e: WheelEvent) {
        e.preventDefault();
        mapRenderer.zoom(e.clientX, e.clientY, canvas.getBoundingClientRect(), e.deltaY);
    }
</script>

<svelte:window
    onmousemove={(e) => mapRenderer.dragMove(e.clientX, e.clientY)}
    onmouseup={mapRenderer.dragEnd}
/>

<div class="main-layout">
    <div bind:clientWidth={wrapperWidth} class="canvas-wrap">
        <canvas
            bind:this={canvas}
            class:dragging={mapRenderer.isDragging}
            onmousedown={(e) => mapRenderer.dragStart(e.clientX, e.clientY)}
            onwheel={handleWheel}
            onmousemove={(e) =>
                mapRenderer.handleMouseMove(e.clientX, e.clientY, canvas.getBoundingClientRect())
            }
            onmouseleave={mapRenderer.handleMouseLeave}
        ></canvas>

        {#if gameState.loading || !mapRenderer.ready}
            <div id="loading">loading map...</div>
        {/if}
    </div>

    <div id="canvas-footer">
        <div class="hint">scroll to zoom &nbsp;·&nbsp; drag to pan</div>
        <div class="hint country-display">
            {mapRenderer.hoveredCountry ?? ''}
        </div>
    </div>

    <ContinentPanel />
</div>

<style>
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
