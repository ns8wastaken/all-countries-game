<script lang='ts'>
    import { gameState } from "../lib/stores/gameStore.svelte";
    import { TimerType } from "../lib/types";

    let seconds = $state(0);
    let timerLimit = $state(900);
    let timerMode: TimerType = $state(TimerType.Stopwatch);
    let inputValue = $state('');

    const feedback = $state({ text: '', color: '' });
    let feedbackTimer: number;

    const isActive = $derived(!gameState.loading && !gameState.gaveUp && !gameState.complete);
    const canPlay = $derived(isActive && !gameState.isPaused);

    const currentSeconds = $derived(
        timerMode === TimerType.Stopwatch
            ? seconds
            : timerLimit - seconds
    );
    const displayTime = $derived(`${Math.floor(currentSeconds / 60)}:${(currentSeconds % 60).toString().padStart(2, '0')}`);

    function showFeedback(text: string, color: string, time = 3000) {
        clearTimeout(feedbackTimer);
        feedback.text = text;
        feedback.color = color;
        feedbackTimer = setTimeout(() => feedback.text = '', time);
    }

    $effect(() => {
        if (canPlay && gameState.foundCount > 0) {
            const interval = setInterval(() => {
                seconds++;
                // Auto-end if timer mode hits zero
                if (timerMode === TimerType.Timer && currentSeconds <= 0) {
                    onGiveUp();
                    showFeedback("Time's up!", "#e07b39", 99999);
                }
            }, 1000);

            const onHide = () => {
                if (document.visibilityState === 'hidden') {
                    gameState.isPaused = true;
                    showFeedback('Game Paused (Tab Hidden)', 'var(--muted)', 99999);
                }
            };

            document.addEventListener('visibilitychange', onHide);
            return () => {
                clearInterval(interval);
                document.removeEventListener('visibilitychange', onHide);
            };
        }
    });

    function toggleMode() {
        if (gameState.foundCount > 0) {
            showFeedback(
                'You incompetent baffoon, you shall not switch the mode whilst the game is afoot.',
                '#e07b39'
            );
            return;
        }; // Prevent switching mid-game
        timerMode = timerMode === TimerType.Stopwatch
            ? TimerType.Timer
            : TimerType.Stopwatch;
    }

    function onInput() {
        const res = gameState.guess(inputValue);
        if (!res) return;

        inputValue = '';
        showFeedback(`+1 ${res._label}`, 'var(--accent)');
        if (gameState.complete)
            showFeedback('You got them all!', 'var(--accent)');
    }

    function togglePause() {
        gameState.isPaused = !gameState.isPaused;
        showFeedback(
            gameState.isPaused ? 'Game Paused' : 'Resumed!',
            gameState.isPaused ? 'var(--muted)' : 'var(--accent)'
        );
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
        seconds = 0;
        showFeedback('', '');
        gameState.reset();
    }
</script>

<div class="hud">
    <button
        class="stat timer-stat"
        onclick={toggleMode}
        disabled={gameState.loading}
        title={seconds === 0 ? "Click to switch Up/Down" : ""}
    >
        {timerMode === TimerType.Stopwatch ? 'Elapsed' : 'Remaining'}
        <strong class:warning={timerMode === TimerType.Timer && currentSeconds < 30}>
            {displayTime}
        </strong>
    </button>

    <button onclick={togglePause} disabled={!isActive}>
        {gameState.isPaused ? 'Resume' : 'Pause'}
    </button>

    <input
        type="text"
        bind:value={inputValue}
        oninput={onInput}
        placeholder={gameState.isPaused ? "Paused..." : "type a country..."}
        disabled={!canPlay}
        autocomplete="off" spellcheck="false"
    >

    <div class="stat">
        Score
        <strong>{gameState.foundCount} / {gameState.loading ? "—" : gameState.countryCount}</strong>
    </div>

    <button onclick={onGiveUp} disabled={!isActive}>Give up</button>
    <button onclick={onReset} disabled={gameState.loading}>Reset</button>
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
    }

    input[type="text"]:focus { border-color: var(--accent); }
    input[type="text"]:disabled { background: rgba(0,0,0,0.05); cursor: not-allowed; }
    input[type="text"]::placeholder { color: var(--muted); }

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
