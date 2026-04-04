import type { GeoFeature } from '../types';
import { ALIASES, DATA_URL, NAME_VARIANTS } from '../constants';
import { buildPaths } from './mapStore.svelte';

export const gameState = $state({
    features: [] as GeoFeature[],
    nameIndex: {} as Record<string, GeoFeature>,
    foundSet: new Set<string>(),
    foundCount: 0,
    gaveUp: false,
    loading: true,
    loadError: null as string | null,

    // Total number of countries in the dataset
    get countryCount() {
        return this.features.length;
    },

    // True if every country has been found
    get complete() {
        return this.countryCount > 0 && this.foundCount === this.countryCount;
    },

    guess(raw: string): GeoFeature | undefined {
        const normalised = norm(raw);
        if (!normalised) return undefined;

        const feature = resolveGuess(normalised);
        if (!feature) return undefined;

        if (gameState.foundSet.has(feature._key))
            return undefined;

        // gameState.foundSet.add(feature._key);
        const next = new Set(gameState.foundSet);
        next.add(feature._key);
        gameState.foundSet = next;
        gameState.foundCount++;

        return feature;
    },

    giveUp(): GeoFeature[] {
        if (gameState.gaveUp) return [];

        gameState.gaveUp = true;

        const missed: GeoFeature[] = [];
        gameState.features.forEach((f) => {
            if (!gameState.foundSet.has(f._key))
                missed.push(f);
        });

        return missed;
    },

    reset(): void {
        gameState.foundSet.clear();
        gameState.foundCount = 0;
        gameState.gaveUp = false;
    },

    async loadData(): Promise<void> {
        gameState.loading = true;
        gameState.loadError = null;

        try {
            const res = await fetch(DATA_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const geo = await res.json();

            const parsed: GeoFeature[] = (geo.features as GeoFeature[])
                .map((f) => {
                    const p = f.properties ?? {};
                    const label = p['ADMIN'] || p['FORMAL_EN'] || '';
                    f._label = label;
                    f._key = norm(label);
                    return f;
                })
                .filter((f) => Boolean(f._key));

            buildPaths(parsed);

            gameState.features = parsed;
            gameState.nameIndex = buildNameIndex(parsed);
        } catch (err) {
            gameState.loadError = err instanceof Error ? err.message : 'Failed to load map data';
            console.error(err);
        } finally {
            gameState.loading = false;
        }
    }
});

const norm = (s: string) => s.toLowerCase().trim();

function resolveGuess(raw: string): GeoFeature | undefined {
    const direct = gameState.nameIndex[raw];
    if (direct) return direct;

    const aliased = ALIASES[raw];
    if (aliased) return gameState.nameIndex[norm(aliased)];

    return undefined;
}

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
