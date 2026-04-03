<script lang='ts'>
    import Hud from "./lib/Hud.svelte";
    import MainLayout from "./lib/MainLayout.svelte";
</script>

<header>
    <h1>Country Guesser</h1>
</header>

<Hud />

<div id='feedback'></div>

<MainLayout />

<style>
    /* -- Header -- */

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

    /* -- Feedback bar -- */

    #feedback {
        width: 100%;
        max-width: 1200px;
        height: 18px;
        font-family: var(--font-display);
        font-size: 0.78rem;
        letter-spacing: 0.04em;
        margin-bottom: 6px;
    }
</style>
