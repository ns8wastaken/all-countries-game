import { THEMES, type MapTheme } from '../themes';

class ThemeStore {
    current = $state<MapTheme>(THEMES.minimalist);

    get cssVars() {
        return `
            --bg: ${this.current.background};
            --surface: ${this.current.surface};
            --surface-hover: ${this.current.surfaceHover};
            --border: ${this.current.border};
            --border-hover: ${this.current.borderHover};

            --text: ${this.current.text};
            --text-muted: ${this.current.textMuted};
            --warning: ${this.current.warning};

            --success: ${this.current.success};
            --success-container: ${this.current.successContainer};
            --success-outline: ${this.current.successOutline};

            --error: ${this.current.error};
            --error-hover: ${this.current.errorHover};
            --error-container: ${this.current.errorContainer};
            --error-outline: ${this.current.errorOutline};
        `;
    }
}

export const themeStore = new ThemeStore();
