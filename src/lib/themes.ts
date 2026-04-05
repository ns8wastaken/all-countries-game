export interface MapTheme {
    name: string;
    background: string;
    default: { fill: string; stroke: string; lineWidth: number };
    found:   { fill: string; stroke: string; lineWidth: number };
    missed:  { fill: string; stroke: string; lineWidth: number };
}

export const THEMES: Record<string, MapTheme> = {
    minimalist: {
        name: 'Minimalist Ghost',
        background: '#1a1a1a',
        default: { fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.18)', lineWidth: 0.5 },
        found:   { fill: 'rgba(46,204,113,0.35)',  stroke: 'rgba(46,204,113,0.7)',   lineWidth: 0.8 },
        missed:  { fill: 'rgba(192,57,43,0.25)',  stroke: 'rgba(192,57,43,0.5)',   lineWidth: 0.5 },
    },

    classic: {
        name: 'Midnight Commander',
        background: '#1a1d27',
        default: { fill: '#2a3042', stroke: '#3d4560', lineWidth: 0.5 },
        found:   { fill: 'rgba(46,204,113,0.5)', stroke: '#27ae60', lineWidth: 0.8 },
        missed:  { fill: 'rgba(192,57,43,0.4)', stroke: '#922b21', lineWidth: 0.5 },
    },

    vintage: {
        name: 'Old Parchment',
        background: '#ebe5d8',
        default: { fill: '#e6d5bc', stroke: '#d1bfa7', lineWidth: 0.4 },
        found:   { fill: '#7da47d', stroke: '#4a6d4a', lineWidth: 0.8 },
        missed:  { fill: '#c27e7e', stroke: '#8e4a4a', lineWidth: 0.4 },
    },

    neon: {
        name: 'Cyberpunk',
        background: '#050505',
        default: { fill: '#111', stroke: '#333', lineWidth: 0.3 },
        found:   { fill: 'rgba(0, 255, 255, 0.2)', stroke: '#00ffff', lineWidth: 1.2 },
        missed:  { fill: 'rgba(255, 0, 255, 0.2)', stroke: '#ff00ff', lineWidth: 0.8 },
    },

    blueprint: {
        name: 'Blueprint',
        background: '#1a3a6d',
        default: { fill: 'rgba(255, 255, 255, 0.05)', stroke: 'rgba(255, 255, 255, 0.2)', lineWidth: 0.5 },
        found:   { fill: '#fff', stroke: '#fff', lineWidth: 1.5 },
        missed:  { fill: 'rgba(255, 200, 0, 0.3)', stroke: '#ffcc00', lineWidth: 0.8 },
    }
};
