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
</style>
