<script lang='ts'>
</script>

<header>
    <h1>Country Guesser</h1>
</header>

<div class='hud'>
    <input
        type='text'
        id='country-input'
        placeholder='type a country name...'
        autocomplete='off'
        spellcheck='false'
        disabled
    >
    <div class='stat'>Found<strong id='count'>0</strong></div>
    <div class='stat'>Total<strong id='total'>—</strong></div>
    <button id='give-up-btn' disabled>Give up</button>
    <button id='reset-btn' disabled>Reset</button>
</div>

<div id='feedback'></div>

<div class='main-layout'>
    <div class='canvas-wrap'>
        <canvas id='map'></canvas>
        <div id='loading'>loading map...</div>
    </div>

    <div id='hint'>scroll to zoom &nbsp;·&nbsp; drag to pan</div>

    <div class='continent-panel' id='continent-panel'></div>
</div>

<style>
    /* ── Header ── */

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

    /* ── HUD ── */

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
    }

    .stat strong {
        display: block;
        font-size: 1.2rem;
        font-weight: 500;
        color: var(--text);
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

    /* ── Feedback bar ── */

    #feedback {
        width: 100%;
        max-width: 1200px;
        height: 18px;
        font-family: var(--font-display);
        font-size: 0.78rem;
        letter-spacing: 0.04em;
        margin-bottom: 6px;
    }

    /* ── Main layout ── */

    .main-layout {
        width: 100%;
        max-width: 1200px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    /* ── Canvas ── */

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

    /* ── Continent panel ── */

    .continent-panel {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 12px;
    }

    .continent-block {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 10px 12px;
    }

    .continent-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .continent-name {
        font-family: var(--font-display);
        font-size: 0.68rem;
        font-weight: 500;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--muted);
    }

    .continent-progress {
        font-family: var(--font-display);
        font-size: 0.65rem;
        color: var(--muted);
    }

    .country-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    .country-pill {
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 3px 7px;
        font-family: var(--font-display);
        font-size: 0.62rem;
        letter-spacing: 0.02em;
        color: transparent;
        background: transparent;
        transition: background 0.2s, color 0.2s, border-color 0.2s;
        user-select: none;
        min-width: 28px;
        text-align: center;
    }

    .country-pill.found {
        background: rgba(46, 204, 113, 0.12);
        border-color: rgba(46, 204, 113, 0.3);
        color: var(--accent);
        animation: pop 0.2s ease;
    }

    .country-pill.missed {
        background: rgba(192, 57, 43, 0.12);
        border-color: rgba(192, 57, 43, 0.3);
        color: #e07b7b;
    }

    @keyframes pop {
        from { transform: scale(0.85); opacity: 0; }
        to   { transform: scale(1);    opacity: 1; }
    }

    /* ── Responsive ── */

    @media (max-width: 600px) {
        .continent-panel {
            grid-template-columns: 1fr;
        }
    }
</style>
