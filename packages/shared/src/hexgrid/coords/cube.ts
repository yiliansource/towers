import type { Cube, HexDirection } from "../types.js";

export const CUBE_DIRECTIONS: readonly Cube[] = [
    { x: 1, y: -1, z: 0 },
    { x: 1, y: 0, z: -1 },
    { x: 0, y: 1, z: -1 },
    { x: -1, y: 1, z: 0 },
    { x: -1, y: 0, z: 1 },
    { x: 0, y: -1, z: 1 },
] as const;

export function cube(x: number, y: number, z: number): Cube {
    if (x + y + z !== 0) {
        throw new Error(`Invalid cube coordinate: (${x}, ${y}, ${z})`);
    }

    return { x, y, z };
}

export function isCube(value: unknown): value is Cube {
    return (
        typeof value === "object" &&
        value !== null &&
        "x" in value &&
        "y" in value &&
        "z" in value &&
        typeof (value as { x: unknown }).x === "number" &&
        typeof (value as { y: unknown }).y === "number" &&
        typeof (value as { z: unknown }).z === "number"
    );
}

export function isValidCube(coord: Cube): boolean {
    return coord.x + coord.y + coord.z === 0;
}

export function equalCube(a: Cube, b: Cube): boolean {
    return a.x === b.x && a.y === b.y && a.z === b.z;
}

export function addCube(a: Cube, b: Cube): Cube {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function subCube(a: Cube, b: Cube): Cube {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function scaleCube(coord: Cube, factor: number): Cube {
    return {
        x: coord.x * factor,
        y: coord.y * factor,
        z: coord.z * factor,
    };
}

export function cubeDirection(dir: HexDirection): Cube {
    return CUBE_DIRECTIONS[dir];
}

export function cubeNeighbor(coord: Cube, dir: HexDirection): Cube {
    return addCube(coord, cubeDirection(dir));
}

export function cubeLength(coord: Cube): number {
    return Math.max(Math.abs(coord.x), Math.abs(coord.y), Math.abs(coord.z));
}

export function cubeDistance(a: Cube, b: Cube): number {
    return cubeLength(subCube(a, b));
}
