<script lang="ts">
    import { gameState } from "../lib/stores/gameStore.svelte";
    import Timer from "./Timer.svelte";

    let inputValue = $state('');
    let timerComponent: Timer;

    const feedback = $state({ text: '', color: '' });
    let feedbackTimer: number;

    const isActive = $derived(!gameState.loading && !gameState.gaveUp && !gameState.complete);
    const canPlay = $derived(isActive && !gameState.isPaused);

    function showFeedback(text: string, color: string, time = 3000) {
        clearTimeout(feedbackTimer);
        feedback.text = text;
        feedback.color = color;
        feedbackTimer = setTimeout(() => feedback.text = '', time);
    }

    function onInput() {
        const res = gameState.guess(inputValue);
        if (!res) return;

        inputValue = '';
        showFeedback(`+1 ${res._label}`, 'var(--accent)');
        if (gameState.complete)
            showFeedback('You got them all!', 'var(--accent)');
    }

    function onGiveUp() {
        gameState.giveUp();
        showFeedback(
            `${gameState.foundCount} / ${gameState.countryCount} — missed ${gameState.countryCount - gameState.foundCount}`,
            '#e07b39',
            99999
        );
    }

    function onReset() {
        inputValue = '';
        showFeedback('', '');
        timerComponent?.resetTimer();
        gameState.reset();
    }
</script>

<div class="hud">
    <Timer
        bind:this={timerComponent}
        loading={gameState.loading}
        foundCount={gameState.foundCount}
        isActive={isActive}
        bind:isPaused={gameState.isPaused}
        ongiveup={onGiveUp}
        onfeedback={showFeedback}
    />

    <input
        type="text"
        bind:value={inputValue}
        oninput={onInput}
        placeholder={gameState.isPaused ? "Paused..." : "Type a country..."}
        disabled={!canPlay}
        autocomplete="off"
        spellcheck="false"
    >

    <div class="container">
        Score
        <strong>{gameState.foundCount} / {gameState.loading ? "—" : gameState.countryCount}</strong>
    </div>

    <div class="container">
        <button onclick={onGiveUp} disabled={!isActive}>Give up</button>
        <button onclick={onReset} disabled={gameState.loading}>Reset</button>
    </div>
</div>

<div id="feedback" style:color={feedback.color}>
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
        margin: 10px 0;
    }

    input[type="text"]:focus { border-color: var(--accent); }
    input[type="text"]:disabled { background: rgba(0,0,0,0.05); cursor: not-allowed; }
    input[type="text"]::placeholder { color: var(--muted); }

    .container {
        display: block;
        padding: 0.35rem 0.9rem;
        white-space: nowrap;

        strong {
            display: block;
            font-size: 1.2rem;
            font-weight: 500;
            color: var(--text);
        }
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
