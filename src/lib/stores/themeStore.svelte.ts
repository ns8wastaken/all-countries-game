import { THEMES, type MapTheme } from '../themes';

class ThemeStore {
    current = $state<MapTheme>(THEMES.minimalist);

    get cssVars() {
        return `
            --bg: ${this.current.background};
            --surface: ${this.current.surface};
            --border: ${this.current.border};
            --text: ${this.current.text};
            --muted: ${this.current.muted};
            --accent: ${this.current.accent};
        `;
    }
}

export const themeStore = new ThemeStore();
