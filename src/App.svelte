<script lang='ts'>
    import { onMount } from 'svelte';
    import TopBar from './components/TopBar.svelte';
    import MainLayout from './components/MainLayout.svelte';
    import { gameState } from './lib/stores/gameStore.svelte';
    import { mapRenderer, setupMapEffects } from './lib/stores/mapStore.svelte';
    import { THEMES } from './lib/themes';
    import { themeStore } from './lib/stores/themeStore.svelte';

    onMount(() => {
        setupMapEffects();
        gameState
            .loadData()
            .then(mapRenderer.buildPaths);
    });
</script>

<div class="app-wrapper" style="{themeStore.cssVars}; background-color: var(--bg); color: var(--text);">
    <header>
        <h1>Country Guesser</h1>

        <div class="theme-picker">
            <select bind:value={themeStore.current}>
                {#each Object.entries(THEMES) as [_key, theme]}
                    <option value={theme}>
                        {theme.name}
                    </option>
                {/each}
            </select>
        </div>
    </header>

    <TopBar />
    <MainLayout />
</div>

<style>
    .app-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem 2.5rem;
        gap: 0;
    }

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
        color: var(--text-muted);
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
        border-color: var(--success);
        color: var(--text);
    }

    .theme-picker select option {
        background: var(--surface);
        color: white;
    }
</style>
