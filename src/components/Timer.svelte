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
                    onfeedback("Time's up!", "#e07b39", 99999);
                }
            }, 1000);

            const onHide = () => {
                if (document.visibilityState === 'hidden') {
                    isPaused = true;
                    onfeedback('Game Paused (Tab Hidden)', 'var(--muted)', 99999);
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
                '#e07b39'
            );
            return;
        }
        timerMode = timerMode === TimerType.Stopwatch ? TimerType.Timer : TimerType.Stopwatch;
    }

    function togglePause() {
        isPaused = !isPaused;
        onfeedback(
            isPaused ? 'Game Paused' : 'Resumed!',
            isPaused ? 'var(--muted)' : 'var(--accent)'
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
        class="action-btn"
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
            color: #e07b39;
        }
    }

    .action-btn {
        background: rgba(255, 255, 255, 0.075);
        padding: 0.55rem 0.8rem;
        border: 0px solid var(--border);
        border-radius: 4px;
        color: var(--muted);
        cursor: pointer;
    }

    .action-btn:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.225);
        color: var(--text);
    }

    .action-btn:disabled {
        opacity: 0.3;
        cursor: default;
    }
</style>
