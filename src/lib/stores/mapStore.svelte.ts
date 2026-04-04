import type { CachedPaths, DragState, GeoFeature, Transform } from '../types';
import { ASPECT } from '../constants';
import { gameState } from './gameStore.svelte';

// --- State ---

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

export const canvasSize = $state({ w: 0, h: 0 });

const transform = $state<Transform>({ x: 0, y: -200, scale: 1 });

const drag = $state<DragState>({
    active: false,
    sx: 0,
    sy: 0,
    tx: 0,
    ty: 0,
});

let cachedPaths = $state<CachedPaths>({
    default: new Path2D(),
    found:   new Path2D(),
    missed:  new Path2D(),
});

export function isDragging(): boolean { return drag.active };

let pathVersion = $state(0);

// --- Draw ---

export function setupCanvasDraw() {
    $effect(() => {
        const { w, h } = canvasSize;
        const { x, y, scale } = transform;
        pathVersion; // read it just to cause update

        if (!ctx || w === 0 || h === 0) return;

        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Default (unseen) countries
        ctx.fillStyle   = 'rgba(255,255,255,0.06)';
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth   = 0.5 / scale;
        ctx.fill(cachedPaths.default);
        ctx.stroke(cachedPaths.default);

        // Found countries
        ctx.fillStyle   = 'rgba(46,204,113,0.35)';
        ctx.strokeStyle = 'rgba(46,204,113,0.7)';
        ctx.lineWidth   = 0.8 / scale;
        ctx.fill(cachedPaths.found);
        ctx.stroke(cachedPaths.found);

        // Missed countries (after give-up)
        ctx.fillStyle   = 'rgba(192,57,43,0.25)';
        ctx.strokeStyle = 'rgba(192,57,43,0.5)';
        ctx.lineWidth   = 0.5 / scale;
        ctx.fill(cachedPaths.missed);
        ctx.stroke(cachedPaths.missed);

        ctx.restore();
    });
}

export function setupCacheReload() {
    $effect(() => {
        const { features, foundSet, gaveUp } = gameState;
        if (features.length === 0) return;
        rebuildCachedPaths(features, foundSet, gaveUp);
    });
}

// --- Logic ---

export function mercator(lon: number, lat: number): [number, number] {
    const x = (lon + 180) / 360 * canvasSize.w;
    const s = Math.sin(lat * Math.PI / 180);
    const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * canvasSize.w;
    return [x, y];
}

export function setCanvasWidth(w: number): void {
    const h = Math.round(w / ASPECT);

    canvasSize.w = w;
    canvasSize.h = h;

    if (!canvas) return;
    canvas.width  = w;
    canvas.height = h;
}

export function initCanvas(el: HTMLCanvasElement, wrapperWidth: number): void {
    canvas = el;
    ctx = canvas.getContext('2d');

    setCanvasWidth(wrapperWidth);

    // Center the map vertically
    transform.x = 0;
    transform.y = 0;
    transform.scale = 1;
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

// Called after initCanvas()
export function buildPaths(features: GeoFeature[]): void {
    features.forEach((f) => {
        f._path = buildPath2D(f.geometry);
    });
}

export function rebuildCachedPaths(
    features: GeoFeature[],
    foundSet: Set<string>,
    gaveUp: boolean
): void {
    const def    = new Path2D();
    const found  = new Path2D();
    const missed = new Path2D();

    features.forEach((f) => {
        if (foundSet.has(f._key))  found.addPath(f._path);
        else if (gaveUp)           missed.addPath(f._path);
        else                       def.addPath(f._path);
    });

    // Assign all at once so the draw $effect only fires once.
    cachedPaths.default = def;
    cachedPaths.found   = found;
    cachedPaths.missed  = missed;

    // Bump version to trigger the draw $effect
    pathVersion++;
}

// --- Updates ---

export function zoom(
    clientX: number,
    clientY: number,
    canvasRect: DOMRect,
    deltaY: number
): void {
    const mx = (clientX - canvasRect.left) * (canvasSize.w / canvasRect.width);
    const my = (clientY - canvasRect.top)  * (canvasSize.h / canvasRect.height);
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
