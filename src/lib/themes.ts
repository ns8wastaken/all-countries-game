export interface MapTheme {
    name: string;

    // UI layout
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;
    borderHover: string;

    text: string;
    textMuted: string;
    warning: string;

    // System feedback & states
    success: string;
    successContainer: string;
    successOutline: string;

    error: string;
    errorHover: string;
    errorContainer: string;
    errorOutline: string;

    // Game / map engine config
    map: {
        default: { fill: string; stroke: string; lineWidth: number };
        found:   { fill: string; stroke: string; lineWidth: number };
        missed:  { fill: string; stroke: string; lineWidth: number };
    };
}

export const THEMES: Record<string, MapTheme> = {
    minimalist: {
        name: 'Minimalist',

        background:   '#141414',
        surface:      '#1e1e1e',
        surfaceHover: '#262626',

        text:      '#ffffff',
        textMuted: '#7a7a7a',
        warning:   '#e07b39',

        border:      'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(255, 255, 255, 0.25)',

        success:          '#2ecc71',
        successContainer: 'rgba(46, 204, 113, 0.12)',
        successOutline:   'rgba(46, 204, 113, 0.3)',

        error:          '#e74c3c',
        errorHover:     '#c0392b',
        errorContainer: 'rgba(192, 57, 43, 0.12)',
        errorOutline:   'rgba(192, 57, 43, 0.3)',

        map: {
            default: {
                fill: 'rgba(255, 255, 255, 0.05)',
                stroke: 'rgba(255, 255, 255, 0.12)',
                lineWidth: 0.5
            },
            found: {
                fill: 'rgba(46, 204, 113, 0.25)',
                stroke: 'rgba(46, 204, 113, 0.75)',
                lineWidth: 0.8
            },
            missed: {
                fill: 'rgba(231, 76, 60, 0.2)',
                stroke: 'rgba(231, 76, 60, 0.55)',
                lineWidth: 0.5
            }
        }
    },

    vintage: {
        name: 'Vintage',

        background:   '#ebe5d8',
        surface:      '#e6d5bc',
        surfaceHover: '#ded0b6',

        text:      '#4a3f35',
        textMuted: '#8c7d6b',
        warning:   '#c97a34',

        border:      'rgba(140, 125, 107, 0.25)',
        borderHover: 'rgba(140, 125, 107, 0.5)',

        success:          '#4a6d4a',
        successContainer: 'rgba(74, 109, 74, 0.12)',
        successOutline:   'rgba(74, 109, 74, 0.3)',

        error:          '#8e4a4a',
        errorHover:     '#753b3b',
        errorContainer: 'rgba(142, 74, 74, 0.12)',
        errorOutline:   'rgba(142, 74, 74, 0.3)',

        map: {
            default: {
                fill: '#e6d5bc',
                stroke: '#d1bfa7',
                lineWidth: 0.4
            },
            found: {
                fill: '#7da47d',
                stroke: '#4a6d4a',
                lineWidth: 0.8
            },
            missed: {
                fill: '#c27e7e',
                stroke: '#8e4a4a',
                lineWidth: 0.4
            }
        }
    },

    cyberpunk: {
        name: 'Cyberpunk',

        background:   '#050505',
        surface:      '#111111',
        surfaceHover: '#1c1c1c',

        text:      '#00ffff',
        textMuted: '#ff00ff',
        warning:   '#ffff00',

        border:      'rgba(51, 51, 51, 0.6)',
        borderHover: 'rgba(0, 255, 255, 0.4)',

        success:          '#00ffff',
        successContainer: 'rgba(0, 255, 255, 0.12)',
        successOutline:   'rgba(0, 255, 255, 0.3)',

        error:          '#ff00ff',
        errorHover:     '#cc00cc',
        errorContainer: 'rgba(255, 0, 255, 0.12)',
        errorOutline:   'rgba(255, 0, 255, 0.3)',

        map: {
            default: {
                fill: '#111111',
                stroke: '#333333',
                lineWidth: 0.3
            },
            found: {
                fill: 'rgba(0, 255, 255, 0.2)',
                stroke: '#00ffff',
                lineWidth: 1.2
            },
            missed: {
                fill: 'rgba(255, 0, 255, 0.2)',
                stroke: '#ff00ff',
                lineWidth: 0.8
            }
        }
    },

    blueprint: {
        name: 'Blueprint',

        background:   '#1a3a6d',
        surface:      'rgba(255, 255, 255, 0.05)',
        surfaceHover: 'rgba(255, 255, 255, 0.1)',

        text:      '#ffffff',
        textMuted: 'rgba(255, 255, 255, 0.5)',
        warning:   '#ffcc00',

        border:      'rgba(255, 255, 255, 0.2)',
        borderHover: 'rgba(255, 255, 255, 0.4)',

        success:          '#ffffff',
        successContainer: 'rgba(255, 255, 255, 0.12)',
        successOutline:   'rgba(255, 255, 255, 0.3)',

        error:          '#ef4444',
        errorHover:     '#dc2626',
        errorContainer: 'rgba(239, 68, 68, 0.15)',
        errorOutline:   'rgba(239, 68, 68, 0.4)',

        map: {
            default: {
                fill: 'rgba(255, 255, 255, 0.05)',
                stroke: 'rgba(255, 255, 255, 0.2)',
                lineWidth: 0.5
            },
            found: {
                fill: '#ffffff',
                stroke: '#ffffff',
                lineWidth: 1.5
            },
            missed: {
                fill: 'rgba(255, 200, 0, 0.3)',
                stroke: '#ffcc00',
                lineWidth: 0.8
            }
        }
    },

    high_contrast: {
        name: 'High Contrast',

        background:   '#000000',
        surface:      'rgba(255, 255, 255, 0.05)',
        surfaceHover: 'rgba(255, 255, 255, 0.15)',

        text:      '#ffffff',
        textMuted: 'rgba(255, 255, 255, 0.5)',
        warning:   '#ffff00',

        border:      'rgba(255, 255, 255, 0.2)',
        borderHover: 'rgba(255, 255, 255, 0.5)',

        success:          '#00ff00',
        successContainer: 'rgba(0, 255, 0, 0.15)',
        successOutline:   'rgba(0, 255, 0, 0.4)',

        error:          '#ff0000',
        errorHover:     '#cc0000',
        errorContainer: 'rgba(255, 0, 0, 0.15)',
        errorOutline:   'rgba(255, 0, 0, 0.4)',

        map: {
            default: {
                fill: '#dddddd',
                stroke: '#aaaaaa',
                lineWidth: 0.5
            },
            found: {
                fill: '#00dd00',
                stroke: '#ffffff',
                lineWidth: 1.5
            },
            missed: {
                fill: '#dd0000',
                stroke: '#ffffff',
                lineWidth: 1.5
            }
        }
    },
};
