import type { Cube, HexDirection } from "../types.js";

export const CUBE_DIRECTIONS: readonly Cube[] = [
    { q: 1, r: -1, s: 0 },
    { q: 1, r: 0, s: -1 },
    { q: 0, r: 1, s: -1 },
    { q: -1, r: 1, s: 0 },
    { q: -1, r: 0, s: 1 },
    { q: 0, r: -1, s: 1 },
] as const;

export function cube(x: number, y: number, z: number): Cube {
    if (x + y + z !== 0) {
        throw new Error(`Invalid cube coordinate: (${x}, ${y}, ${z})`);
    }

    return { q: x, r: y, s: z };
}

export function isCube(value: unknown): value is Cube {
    return (
        typeof value === "object" &&
        value !== null &&
        "q" in value &&
        "r" in value &&
        "s" in value &&
        typeof (value as { q: unknown }).q === "number" &&
        typeof (value as { r: unknown }).r === "number" &&
        typeof (value as { s: unknown }).s === "number"
    );
}

export function isValidCube(coord: Cube): boolean {
    return coord.q + coord.r + coord.s === 0;
}

export function equalCube(a: Cube, b: Cube): boolean {
    return a.q === b.q && a.r === b.r && a.s === b.s;
}

export function addCube(a: Cube, b: Cube): Cube {
    return cube(a.q + b.q, a.r + b.r, a.s + b.s);
}

export function subCube(a: Cube, b: Cube): Cube {
    return cube(a.q - b.q, a.r - b.r, a.s - b.s);
}

export function scaleCube(coord: Cube, factor: number): Cube {
    return cube(coord.q * factor, coord.r * factor, coord.s * factor);
}

export function cubeDirection(dir: HexDirection): Cube {
    return CUBE_DIRECTIONS[dir];
}

export function cubeNeighbor(coord: Cube, dir: HexDirection): Cube {
    return addCube(coord, cubeDirection(dir));
}

export function cubeLength(coord: Cube): number {
    return Math.max(Math.abs(coord.q), Math.abs(coord.r), Math.abs(coord.s));
}

export function cubeDistance(a: Cube, b: Cube): number {
    return cubeLength(subCube(a, b));
}

export function cubeRound(f: Cube): Cube {
    let q = Math.round(f.q);
    let r = Math.round(f.r);
    let s = Math.round(f.s);

    const qDiff = Math.abs(q - f.q);
    const rDiff = Math.abs(r - f.r);
    const sDiff = Math.abs(s - f.s);

    if (qDiff > rDiff && qDiff > sDiff) {
        q = -r - s;
    } else if (rDiff > sDiff) {
        r = -q - s;
    } else {
        s = -q - r;
    }

    return cube(q, r, s);
}

export function rotateCubeLeft(a: Cube): Cube {
    return cube(-a.r, -a.s, -a.q);
}

export function rotateCubeRIght(a: Cube): Cube {
    return cube(-a.s, -a.q, -a.r);
}
