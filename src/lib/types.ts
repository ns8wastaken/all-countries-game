export interface GeoFeature {
    type: 'Feature';
    properties: Record<string, string>;
    geometry: {
        type: 'Polygon' | 'MultiPolygon';
        coordinates: number[][][] | number[][][][];
    };
    _label: string;
    _key: string;
    _path: Path2D;
}

export interface Transform {
    x: number;
    y: number;
    scale: number;
}

export interface DragState {
    active: boolean;
    sx: number;
    sy: number;
    tx: number;
    ty: number;
}

export interface CachedPaths {
    default: Path2D;
    found: Path2D;
    missed: Path2D;
}
