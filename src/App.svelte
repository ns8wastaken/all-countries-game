<script lang='ts'>
    import { onMount } from 'svelte';
    import Hud from './components/Hud.svelte';
    import MainLayout from './components/MainLayout.svelte';
    import { gameState } from './lib/stores/gameStore.svelte';
    import { mapRenderer, setupMapEffects } from './lib/stores/mapStore.svelte';

    onMount(() => {
        setupMapEffects();
        gameState.loadData().then(mapRenderer.buildPaths);
    });
</script>

<header>
    <h1>Country Guesser</h1>
</header>

<Hud />
<MainLayout />

<style>
    header {
        width: 100%;
        max-width: 1200px;
        margin-bottom: 1.25rem;
        display: flex;
        align-items: baseline;
        gap: 1rem;
    }

    h1 {
        font-family: var(--font-display);
        font-size: 1.1rem;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text);
    }
</style>
