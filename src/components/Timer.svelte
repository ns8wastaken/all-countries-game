<script lang="ts">
    import { TimerType } from "../lib/types";

    let {
        loading,
        foundCount,
        isActive,
        isPaused = $bindable(),
        ongiveup,
        onfeedback
    } = $props<{
        loading: boolean;
        foundCount: number;
        isActive: boolean;
        isPaused: boolean;
        ongiveup: () => void;
        onfeedback: (text: string, color: string, time?: number) => void;
    }>();

    let seconds = $state(0);
    let timerLimit = $state(900);
    let timerMode: TimerType = $state(TimerType.Stopwatch);

    const canPlay = $derived(isActive && !isPaused);

    const currentSeconds = $derived(
        timerMode === TimerType.Stopwatch
            ? seconds
            : timerLimit - seconds
    );

    const displayTime = $derived(
        `${Math.floor(currentSeconds / 60)}:${(currentSeconds % 60).toString().padStart(2, '0')}`
    );

    $effect(() => {
        if (canPlay && foundCount > 0) {
            const interval = setInterval(() => {
                seconds++;
                if (timerMode === TimerType.Timer && currentSeconds <= 0) {
                    ongiveup();
                    onfeedback("Time's up!", "var(--warning)", 99999);
                }
            }, 1000);

            const onHide = () => {
                if (document.visibilityState === 'hidden') {
                    isPaused = true;
                    onfeedback('Game Paused (Tab Hidden)', 'var(--text-muted)', 99999);
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
        if (foundCount > 0) {
            onfeedback(
                'You incompetent buffoon, you shall not switch the mode whilst the game is afoot.',
                'var(--warning)'
            );
            return;
        }
        timerMode = timerMode === TimerType.Stopwatch ? TimerType.Timer : TimerType.Stopwatch;
    }

    function togglePause() {
        isPaused = !isPaused;
        onfeedback(
            isPaused ? 'Game Paused' : 'Resumed!',
            isPaused ? 'var(--text-muted)' : 'var(--success)'
        );
    }

    export function resetTimer() {
        seconds = 0;
    }
</script>

<div
    class="container"
    role="button"
    tabindex={loading ? -1 : 0}
    onclick={toggleMode}
    onkeydown={(e) => (e.key === ' ' || e.key === 'Enter') && toggleMode()}
    aria-disabled={loading}
    title={seconds === 0 ? "Click to switch Timer/Stopwatch" : ""}
>
    <div class="stat-display">
        {timerMode === TimerType.Stopwatch ? 'Elapsed' : 'Remaining'}
        <strong class:warning={timerMode === TimerType.Timer && currentSeconds < 30}>
            {displayTime}
        </strong>
    </div>

    <button
        onclick={(e) => { e.stopPropagation(); togglePause(); }}
        disabled={!isActive}
    >
        {isPaused ? 'Resume' : 'Pause'}
    </button>
</div>

<style>
    .container {
        cursor: pointer;
    }

    .container:hover:not(:disabled) {
        border-color: var(--border-hover);
        color: var(--text);
    }

    .container[aria-disabled="true"] {
        opacity: 0.3;
        cursor: default;
        pointer-events: none;
    }

    .stat-display {
        padding: 0 0.2rem;
        white-space: nowrap;

        strong {
            display: block;
            font-size: 1.2rem;
            font-weight: 500;
            color: var(--text);
        }

        strong.warning {
            color: var(--warning);
        }
    }

    button {
        background: var(--border);
        border: 0px solid var(--border);
        border-radius: 4px;
        padding: 0.55rem 0.8rem;
        color: var(--text-muted);
        cursor: pointer;
    }

    button:hover:not(:disabled) {
        background: var(--border-hover);
        color: var(--text);
    }

    button:disabled {
        opacity: 0.3;
        cursor: default;
    }
</style>
