export interface MapTheme {
    name: string;

    // UI
    background: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    border: string;

    // Game
    default: { fill: string; stroke: string; lineWidth: number };
    found:   { fill: string; stroke: string; lineWidth: number };
    missed:  { fill: string; stroke: string; lineWidth: number };
}

export const THEMES: Record<string, MapTheme> = {
    minimalist: {
        name: 'Minimalist',

        background: '#1a1a1a',
        surface:    '#242424',
        text:       '#ffffff',
        muted:      '#888888',
        accent:     '#2ecc71',
        border:     'rgba(255,255,255,0.1)',

        default: { fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.18)', lineWidth: 0.5 },
        found:   { fill: 'rgba(46,204,113,0.35)',  stroke: 'rgba(46,204,113,0.7)',   lineWidth: 0.8 },
        missed:  { fill: 'rgba(192,57,43,0.25)',   stroke: 'rgba(192,57,43,0.5)',    lineWidth: 0.5 },
    },

    classic: {
        name: 'Classic',

        background: '#0f1117',
        surface:    '#1a1d26',
        text:       '#e2e8f0',
        muted:      '#64748b',
        accent:     '#27ae60',
        border:     '#3d4560',

        default: { fill: '#2a3042',              stroke: '#3d4560', lineWidth: 0.5 },
        found:   { fill: 'rgba(46,204,113,0.5)', stroke: '#27ae60', lineWidth: 0.8 },
        missed:  { fill: 'rgba(192,57,43,0.4)',  stroke: '#922b21', lineWidth: 0.5 },
    },

    vintage: {
        name: 'Vintage',

        background: '#ebe5d8',
        surface:    '#e6d5bc',
        text:       '#4a3f35',
        muted:      '#8c7d6b',
        accent:     '#4a6d4a',
        border:     '#d1bfa7',

        default: { fill: '#e6d5bc', stroke: '#d1bfa7', lineWidth: 0.4 },
        found:   { fill: '#7da47d', stroke: '#4a6d4a', lineWidth: 0.8 },
        missed:  { fill: '#c27e7e', stroke: '#8e4a4a', lineWidth: 0.4 },
    },

    cyberpunk: {
        name: 'Cyberpunk',

        background: '#050505',
        surface:    '#111111',
        text:       '#00ffff',
        muted:      '#ff00ff',
        accent:     '#00ffff',
        border:     '#333333',

        default: { fill: '#111',                   stroke: '#333',    lineWidth: 0.3 },
        found:   { fill: 'rgba(0, 255, 255, 0.2)', stroke: '#00ffff', lineWidth: 1.2 },
        missed:  { fill: 'rgba(255, 0, 255, 0.2)', stroke: '#ff00ff', lineWidth: 0.8 },
    },

    blueprint: {
        name: 'Blueprint',

        background: '#1a3a6d',
        surface:    'rgba(255, 255, 255, 0.05)',
        text:       '#ffffff',
        muted:      'rgba(255, 255, 255, 0.5)',
        accent:     '#ffcc00',
        border:     'rgba(255, 255, 255, 0.2)',

        default: { fill: 'rgba(255, 255, 255, 0.05)', stroke: 'rgba(255, 255, 255, 0.2)', lineWidth: 0.5 },
        found:   { fill: '#fff',                      stroke: '#fff',                     lineWidth: 1.5 },
        missed:  { fill: 'rgba(255, 200, 0, 0.3)',    stroke: '#ffcc00',                  lineWidth: 0.8 },
    }
};
