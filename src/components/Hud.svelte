<script lang='ts'>
    import { gameState } from "../lib/stores/gameStore.svelte";

    const feedback = $state({ text: '', color: '' });
    let feedbackTimer: number;

    function showFeedback(text: string, color: string, time: number = 3000) {
        clearTimeout(feedbackTimer);
        feedback.text = text;
        feedback.color = color;
        feedbackTimer = setTimeout(() => { feedback.text = ''; }, time);
    }

    let inputValue = $state('');

    function onInput() {
        const res = gameState.guess(inputValue);
        if (!res) return;
        inputValue = '';
        showFeedback('+1  ' + res._label, 'var(--accent)');
        if (gameState.complete)
            showFeedback('You got them all!', 'var(--accent)');
    }

    function onGiveUp() {
        gameState.giveUp();
        const missed = gameState.countryCount - gameState.foundCount;
        showFeedback(
            `${gameState.foundCount} / ${gameState.countryCount} — missed ${missed}`,
            '#e07b39',
            6000
        );
    }

    function onReset() {
        inputValue    = '';
        feedback.text = '';
        clearTimeout(feedbackTimer);
        gameState.reset();
    }
</script>

<div class="hud">
    <input
        type="text"
        id="country-input"
        bind:value={inputValue}
        oninput={onInput}
        placeholder="type a country name..."
        autocomplete="off"
        spellcheck="false"
        disabled={gameState.loading || gameState.gaveUp}
    >

    <div class="stat">Found<strong id="count">
        {gameState.foundCount}
    </strong></div>
    <div class="stat">Total<strong id="total">
        {gameState.loading ? "—" : gameState.countryCount}
    </strong></div>

    <button
        id="give-up-btn"
        onclick={onGiveUp}
        disabled={gameState.loading || gameState.gaveUp}
    >Give up</button>

    <button
        id="reset-btn"
        onclick={onReset}
        disabled={gameState.loading}
    >Reset</button>
</div>

<div id="feedback" style="color: {feedback.color}">
    {feedback.text}
</div>

<style>
    .hud {
        width: 100%;
        max-width: 1200px;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        flex-wrap: wrap;
    }

    input[type="text"] {
        flex: 1;
        min-width: 200px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--text);
        font-family: var(--font-display);
        font-size: 0.9rem;
        padding: 0.55rem 0.9rem;
        outline: none;
        transition: border-color 0.15s;
    }

    input[type="text"]:focus {
        border-color: var(--accent);
    }

    input[type="text"]::placeholder {
        color: var(--muted);
    }

    .stat {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 0.35rem 0.9rem;
        font-family: var(--font-display);
        font-size: 0.7rem;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        white-space: nowrap;
        line-height: 1.2;

        strong {
            display: block;
            font-size: 1.2rem;
            font-weight: 500;
            color: var(--text);
        }
    }

    button {
        background: transparent;
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--muted);
        font-family: var(--font-display);
        font-size: 0.7rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 0.55rem 1rem;
        cursor: pointer;
        transition: border-color 0.15s, color 0.15s;
    }

    button:hover {
        border-color: var(--border-hover);
        color: var(--text);
    }

    button:disabled {
        opacity: 0.3;
        cursor: default;
    }

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
