<script lang="ts">
    import { gameState } from '../lib/stores/gameStore.svelte';
    import type { GeoFeature } from '../lib/types';

    // -- Group features by continent ----------------------------------------

    const continentGroups = $derived.by(() => {
        const map = new Map<string, GeoFeature[]>();

        for (const f of gameState.features) {
            const continent = f.properties['CONTINENT'] ?? 'Other';
            if (!map.has(continent)) map.set(continent, []);
            map.get(continent)!.push(f);
        }

        return Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([continent, list]) => ({
                continent,
                // Sort countries once at initialization
                countries: list.slice().sort((a, b) =>
                    a._label.localeCompare(b._label)
                )
            }));
    });

    function foundInContinent(countries: GeoFeature[]): number {
        return countries.filter((f) => gameState.foundSet.has(f._key)).length;
    }

    // -- Pill state ---------------------------------------------------------

    export const PillState = { Hidden: 0, Found: 1, Missed: 2, } as const;
    type PillState = typeof PillState[keyof typeof PillState];

    function pillState(key: string): PillState {
        if (gameState.foundSet.has(key)) return PillState.Found;
        if (gameState.gaveUp) return PillState.Missed;
        return PillState.Hidden;
    }
</script>

<div class="continent-panel">
    {#each continentGroups as { continent, countries } (continent)}
        <div class="continent-block">
            <div class="continent-header">
                <span class="continent-name">{continent}</span>
                <span class="continent-progress">
                    {foundInContinent(countries)} / {countries.length}
                </span>
            </div>

            <div class="country-grid">
                {#each countries as f (f._key)}
                    {@const state = pillState(f._key)}
                    <span
                        class="country-pill"
                        class:found={state === PillState.Found}
                        class:missed={state === PillState.Missed}
                    >
                        {f._label}
                    </span>
                {/each}
            </div>
        </div>
    {/each}
</div>

<style>
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

    @media (max-width: 600px) {
        .continent-panel {
            grid-template-columns: 1fr;
        }
    }
</style>
