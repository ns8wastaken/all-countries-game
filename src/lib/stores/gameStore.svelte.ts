import type { GeoFeature } from '../types';
import { ALIASES, DATA_URL, NAME_VARIANTS } from '../constants';

class GameState {
    features   = $state<GeoFeature[]>([]);
    foundSet   = $state(new Set<string>());
    foundCount = $state(0);
    gaveUp     = $state(false);
    loading    = $state(true);
    loadError  = $state<string | null>(null);

    #nameIndex: Record<string, GeoFeature> = {};

    get countryCount(): number { return this.features.length; }
    get complete(): boolean {
        return this.countryCount > 0 && this.foundCount === this.countryCount;
    }

    guess(raw: string): GeoFeature | undefined {
        const key = norm(raw);
        if (!key) return undefined;

        const feature = this.#resolveGuess(key);
        if (!feature || this.foundSet.has(feature._key))
            return undefined;

        // New set to trigger reactive updates ($effect or $derive)
        this.foundSet = new Set(this.foundSet).add(feature._key);
        this.foundCount++;

        return feature;
    }

    giveUp(): void {
        if (this.gaveUp) return;
        this.gaveUp = true;
    }

    reset(): void {
        this.foundSet   = new Set();
        this.foundCount = 0;
        this.gaveUp     = false;
    }

    async loadData(): Promise<void> {
        this.loading   = true;
        this.loadError = null;

        try {
            const res = await fetch(DATA_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const geo = await res.json();

            const parsed: GeoFeature[] = (geo.features as GeoFeature[])
                .map((f) => {
                    const p = f.properties ?? {};
                    const label = p['ADMIN'] || p['FORMAL_EN'] || '';
                    f._label = label;
                    f._key   = norm(label);
                    return f;
                })
                .filter((f) => Boolean(f._key));

            this.#nameIndex = buildNameIndex(parsed);
            this.features = parsed;
        } catch (err) {
            this.loadError = err instanceof Error ? err.message : 'Failed to load map data';
            console.error(err);
        } finally {
            this.loading = false;
        }
    }

    #resolveGuess(key: string): GeoFeature | undefined {
        const direct = this.#nameIndex[key];
        if (direct) return direct;

        const alias = ALIASES[key];
        if (alias) return this.#nameIndex[norm(alias)];

        return undefined;
    }
}

export const gameState = new GameState();

// ---------------------------------------------------------------------------

const norm = (s: string) => s.toLowerCase().trim();

function buildNameIndex(features: GeoFeature[]): Record<string, GeoFeature> {
    const index: Record<string, GeoFeature> = {};

    features.forEach((f) => {
        index[f._key] = f;
        NAME_VARIANTS.forEach((prop) => {
            const val = f.properties[prop];
            if (val) index[norm(val)] = f;
        });
    });

    Object.entries(ALIASES).forEach(([alias, canonical]) => {
        const target = index[norm(canonical)];
        if (target) index[norm(alias)] = target;
    });

    return index;
}
