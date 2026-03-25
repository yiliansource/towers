export type Axial = Readonly<{
    q: number;
    r: number;
}>;
export type Cube = Readonly<{
    x: number;
    y: number;
    z: number;
}>;

export type HexCoord = Axial;
export type HexDirection = 0 | 1 | 2 | 3 | 4 | 5;
export type HexKey = string;
export type HexMap<T> = Record<HexKey, T>;
