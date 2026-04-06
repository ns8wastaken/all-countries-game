import type { CachedPaths, DragState, GeoFeature, Transform } from '../types';
import { ASPECT } from '../constants';
import { gameState } from './gameStore.svelte';
import { untrack } from 'svelte';
import { THEMES } from '../themes';

// --- State ---

class MapRenderer {
    #canvas: HTMLCanvasElement | null = null;
    #ctx: CanvasRenderingContext2D | null = null;
    #W = 0;
    #H = 0;

    #transform = $state<Transform>({ x: 0, y: -0.07, scale: 1 });
    #drag      = $state<DragState>({ active: false, sx: 0, sy: 0, tx: 0, ty: 0 });
    #paths     = $state<CachedPaths>({
        default: new Path2D(),
        found:   new Path2D(),
        missed:  new Path2D(),
    });

    ready          = $state(false);
    isDragging     = $derived(this.#drag.active);
    theme          = $state(THEMES.classic);
    hoveredCountry = $state<string | null>(null);

    init = (el: HTMLCanvasElement, wrapperWidth: number): void => {
        this.#canvas = el;
        this.#ctx = this.#canvas.getContext('2d')!;

        this.#W = wrapperWidth;
        this.#H = Math.round(this.#W / ASPECT);

        this.#canvas.width  = this.#W;
        this.#canvas.height = this.#H;

        this.#transform.x = 0;
        this.#transform.y = 0;
        this.#transform.scale = 1;

        this.ready = true;
        untrack(this.render);
    }

    // --- Path building ---

    #buildPath2D(geom: GeoFeature['geometry']): Path2D {
        const path = new Path2D();
        if (!geom) return path;

        const addRings = (rings: number[][][]): void => {
            rings.forEach((ring) => {
                ring.forEach(([lon, lat], i) => {
                    const [x, y] = this.#mercator(lon, lat);
                    i === 0 ? path.moveTo(x, y) : path.lineTo(x, y);
                });
                path.closePath();
            });
        };

        if (geom.type === 'Polygon')
            addRings(geom.coordinates as number[][][]);
        if (geom.type === 'MultiPolygon')
            (geom.coordinates as number[][][][]).forEach(addRings);

        return path;
    }

    // Call once after loading data
    buildPaths = (): void => {
        gameState.features.forEach((f) => {
            f._path = this.#buildPath2D(f.geometry);
        });
    }

    rebuildCachedPaths = (): void => {
        const def    = new Path2D();
        const found  = new Path2D();
        const missed = new Path2D();

        gameState.features.forEach((f) => {
            if (!f._path) return; // paths not built yet
            if (gameState.foundSet.has(f._key)) found.addPath(f._path);
            else if (gameState.gaveUp)          missed.addPath(f._path);
            else                                def.addPath(f._path);
        });

        this.#paths = { default: def, found, missed };
    }

    // --- Draw ---

    render = (): void => {
        const ctx = this.#ctx;
        const W   = this.#W;
        const H   = this.#H;
        if (!ctx || W === 0) return;

        const { x, y, scale } = this.#transform;
        const paths = this.#paths;

        if (!ctx || W === 0) return;
        if (this.#canvas) this.#canvas.style.backgroundColor = this.theme.background;

        ctx.clearRect(0, 0, W, H);
        ctx.save();
        ctx.scale(W, W);
        ctx.translate(x / W, y / W);
        ctx.scale(scale, scale);

        // Unseen countries
        ctx.fillStyle   = this.theme.default.fill;
        ctx.strokeStyle = this.theme.default.stroke;
        ctx.lineWidth   = this.theme.default.lineWidth / (scale * W);
        ctx.fill(paths.default, 'evenodd');
        ctx.stroke(paths.default);

        // Found countries
        ctx.fillStyle   = this.theme.found.fill;
        ctx.strokeStyle = this.theme.found.stroke;
        ctx.lineWidth   = this.theme.found.lineWidth / (scale * W);
        ctx.fill(paths.found, 'evenodd');
        ctx.stroke(paths.found);

        // Missed countries
        ctx.fillStyle   = this.theme.missed.fill;
        ctx.strokeStyle = this.theme.missed.stroke;
        ctx.lineWidth   = this.theme.missed.lineWidth / (scale * W);
        ctx.fill(paths.missed, 'evenodd');
        ctx.stroke(paths.missed);

        ctx.restore();
    }

    // --- Ooga booga ---

    #mercator(lon: number, lat: number): [number, number] {
        const x = (lon + 180) / 360;
        const s = Math.sin(lat * Math.PI / 180);
        const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI));
        return [x, y]; // normalized
    }

    // --- Updates ---

    zoom = (clientX: number, clientY: number, canvasRect: DOMRect, deltaY: number): void => {
        const mx = (clientX - canvasRect.left) * (this.#W / canvasRect.width);
        const my = (clientY - canvasRect.top)  * (this.#H / canvasRect.height);
        const delta = deltaY > 0 ? 0.85 : 1.18;

        this.#transform.x = mx + (this.#transform.x - mx) * delta;
        this.#transform.y = my + (this.#transform.y - my) * delta;
        this.#transform.scale *= delta;
    }

    dragStart = (clientX: number, clientY: number): void => {
        this.#drag.active = true;
        this.#drag.sx = clientX;
        this.#drag.sy = clientY;
        this.#drag.tx = this.#transform.x;
        this.#drag.ty = this.#transform.y;
    }

    dragMove = (clientX: number, clientY: number): void => {
        if (!this.#drag.active) return;
        this.#transform.x = this.#drag.tx + (clientX - this.#drag.sx);
        this.#transform.y = this.#drag.ty + (clientY - this.#drag.sy);
    }

    dragEnd = (): void => {
        this.#drag.active = false;
    }

    handleMouseMove = (clientX: number, clientY: number, canvasRect: DOMRect): void => {
        if (!this.#ctx) return;

        const mx = (clientX - canvasRect.left) * (this.#W / canvasRect.width);
        const my = (clientY - canvasRect.top) * (this.#H / canvasRect.height);

        const { x, y, scale } = this.#transform;
        const W = this.#W;

        this.#ctx.save();
        this.#ctx.scale(W, W);
        this.#ctx.translate(x / W, y / W);
        this.#ctx.scale(scale, scale);

        let foundLabel: string | null = null;
        let foundKey: string | null = null;

        for (const f of gameState.features) {
            if (f._path && this.#ctx.isPointInPath(f._path, mx, my, 'evenodd')) {
                foundLabel = f._label;
                foundKey = f._key;
                break;
            }
        }

        this.#ctx.restore();

        if (foundKey && gameState.foundSet.has(foundKey) || gameState.gaveUp) {
            this.hoveredCountry = foundLabel;
        } else {
            this.hoveredCountry = null;
        }
    };

    handleMouseLeave = (): void => {
        this.hoveredCountry = null;
    };
}

export const mapRenderer = new MapRenderer();

export function setupMapEffects(): void {
    // Effect 1: rebuild cached paths whenever game state changes
    $effect(() => {
        const { features: _a, foundSet: _b, gaveUp: _c } = gameState;
        if (!mapRenderer.ready) return;
        mapRenderer.rebuildCachedPaths();
    });

    // Effect 2: draw whenever transform or cachedPaths changes
    $effect(() => {
        mapRenderer.render();
    });
}
