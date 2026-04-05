import type { CachedPaths, DragState, GeoFeature, Transform } from '../types';
import { ASPECT } from '../constants';
import { gameState } from './gameStore.svelte';
import { untrack } from 'svelte';
import { THEMES } from '../themes';

// --- State ---

let activeTheme = $state(THEMES.vintage);

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

export const canvasReady = $state({ value: false });

let W = 0;
let H = 0;

const transform = $state<Transform>({ x: 0, y: 0, scale: 1 });

const drag = $state<DragState>({
    active: false,
    sx: 0,
    sy: 0,
    tx: 0,
    ty: 0,
});

export function isDragging(): boolean { return drag.active };

let cachedPaths = $state<CachedPaths>({
    default: new Path2D(),
    found:   new Path2D(),
    missed:  new Path2D(),
});

// --- Draw ---

function render() {
    if (!ctx || W === 0) return;
    if (canvas) canvas.style.backgroundColor = activeTheme.background;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.scale(W, W);
    ctx.translate(transform.x / W, transform.y / W);
    ctx.scale(transform.scale, transform.scale);

    // Unseen countries
    ctx.fillStyle   = activeTheme.default.fill;
    ctx.strokeStyle = activeTheme.default.stroke;
    ctx.lineWidth   = activeTheme.default.lineWidth / (transform.scale * W);
    ctx.fill(cachedPaths.default, 'evenodd');
    ctx.stroke(cachedPaths.default);

    // Found countries
    ctx.fillStyle   = activeTheme.found.fill;
    ctx.strokeStyle = activeTheme.found.stroke;
    ctx.lineWidth   = activeTheme.found.lineWidth / (transform.scale * W);
    ctx.fill(cachedPaths.found, 'evenodd');
    ctx.stroke(cachedPaths.found);

    // Missed countries
    ctx.fillStyle   = activeTheme.missed.fill;
    ctx.strokeStyle = activeTheme.missed.stroke;
    ctx.lineWidth   = activeTheme.missed.lineWidth / (transform.scale * W);
    ctx.fill(cachedPaths.missed, 'evenodd');
    ctx.stroke(cachedPaths.missed);

    ctx.restore();
}

export function setupMapEffects(): void {
    // Effect 1: rebuild cached paths whenever game state changes
    $effect(() => {
        const { features, foundSet, gaveUp } = gameState;
        if (features.length === 0 || !canvasReady.value) return;

        const def    = new Path2D();
        const found  = new Path2D();
        const missed = new Path2D();

        features.forEach((f) => {
            if (!f._path) return; // paths not built yet
            if (foundSet.has(f._key))  found.addPath(f._path);
            else if (gaveUp)           missed.addPath(f._path);
            else                       def.addPath(f._path);
        });

        cachedPaths = { default: def, found, missed };
    });

    // Effect 2: draw whenever transform or cachedPaths changes
    $effect(() => {
        transform;
        cachedPaths;
        activeTheme;
        render();
    });
}

// --- Logic ---

function mercator(lon: number, lat: number): [number, number] {
    const x = (lon + 180) / 360;
    const s = Math.sin(lat * Math.PI / 180);
    const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI));
    return [x, y]; // normalized
}

function buildPath2D(geom: GeoFeature['geometry']): Path2D {
    const path = new Path2D();
    if (!geom) return path;

    const addRings = (rings: number[][][]): void => {
        rings.forEach((ring) => {
            ring.forEach(([lon, lat], i) => {
                const [x, y] = mercator(lon, lat);
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
export function buildPaths(): void {
    gameState.features.forEach((f) => {
        f._path = buildPath2D(f.geometry);
    });
}

export function initCanvas(el: HTMLCanvasElement, wrapperWidth: number): void {
    canvas = el;
    ctx = canvas.getContext('2d')!;

    W = wrapperWidth;
    H = Math.round(W / ASPECT);

    canvas.width  = W;
    canvas.height = H;

    transform.x = 0;
    transform.y = 0;
    transform.scale = 1;

    canvasReady.value = true;
    untrack(render);
}

// --- Updates ---

export function zoom(
    clientX: number,
    clientY: number,
    canvasRect: DOMRect,
    deltaY: number
): void {
    const mx = (clientX - canvasRect.left) * (W / canvasRect.width);
    const my = (clientY - canvasRect.top)  * (H / canvasRect.height);
    const delta = deltaY > 0 ? 0.85 : 1.18;

    transform.x = mx + (transform.x - mx) * delta;
    transform.y = my + (transform.y - my) * delta;
    transform.scale *= delta;
}

export function dragStart(clientX: number, clientY: number): void {
    drag.active = true;
    drag.sx = clientX;
    drag.sy = clientY;
    drag.tx = transform.x;
    drag.ty = transform.y;
}

export function dragMove(clientX: number, clientY: number): void {
    if (!drag.active) return;
    transform.x = drag.tx + (clientX - drag.sx);
    transform.y = drag.ty + (clientY - drag.sy);
}

export function dragEnd(): void {
    drag.active = false;
}
