<script lang='ts'>
    import { onMount } from 'svelte';
    import Hud from './components/Hud.svelte';
    import MainLayout from './components/MainLayout.svelte';
    import { gameState } from './lib/stores/gameStore.svelte';
    import { mapRenderer, setupMapEffects } from './lib/stores/mapStore.svelte';
    import { THEMES } from './lib/themes';

    onMount(() => {
        setupMapEffects();
        gameState.loadData().then(
            mapRenderer.buildPaths
        );
    });
</script>

<header>
    <h1>Country Guesser</h1>

    <div class="theme-picker">
        <select bind:value={mapRenderer.theme}>
            {#each Object.entries(THEMES) as [_key, theme]}
                <option value={theme}>
                    {theme.name}
                </option>
            {/each}
        </select>
    </div>
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

    .theme-picker select {
        background: none;
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--muted);
        font-family: var(--font-display);
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 2px 6px;
        cursor: pointer;
        outline: none;
        transition: border-color 0.2s, color 0.2s;
    }

    .theme-picker select:hover {
        border-color: var(--accent);
        color: var(--text);
    }

    .theme-picker select option {
        background: #1a1a1a; /* Dark background for the dropdown menu */
        color: white;
    }
</style>
