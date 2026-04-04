<script lang="ts">
    import ContinentPanel from './ContinentPanel.svelte';
    import {
        isDragging,
        dragStart,
        dragMove,
        dragEnd,
        zoom,
        setCanvasWidth,
    } from '../lib/stores/mapStore.svelte';
    import { initCanvas } from '../lib/stores/mapStore.svelte';
    import { gameState } from '../lib/stores/gameStore.svelte';
    import { onMount } from 'svelte';

    let canvas: HTMLCanvasElement;
    let wrapperWidth = $state(0);

    onMount(() => initCanvas(canvas, wrapperWidth))

    $effect(() => {
        if (wrapperWidth > 0) {
            setCanvasWidth(wrapperWidth);
        }
    });

    // Handle zoom
    function handleWheel(e: WheelEvent) {
        e.preventDefault();
        zoom(e.clientX, e.clientY, canvas.getBoundingClientRect(), e.deltaY);
    }
</script>

<svelte:window
    onmousemove={(e) => dragMove(e.clientX, e.clientY)}
    onmouseup={dragEnd}
/>

<div class="main-layout">
    <div bind:clientWidth={wrapperWidth} class="canvas-wrap">
        <canvas
            bind:this={canvas}
            class:dragging={isDragging()}
            onmousedown={(e) => dragStart(e.clientX, e.clientY)}
            onwheel={handleWheel}
        ></canvas>
        {#if gameState.loading}
            <div id="loading">loading map...</div>
        {/if}
    </div>

    <div id="hint">scroll to zoom &nbsp;·&nbsp; drag to pan</div>

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

    #hint {
        margin-bottom: 7px;
        font-size: 0.7rem;
        color: var(--muted);
    }
</style>
