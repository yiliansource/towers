import type { Axial, HexDirection } from "../types.js";
import { axialToCube, cubeToAxial } from "./convert.js";
import { cubeRound } from "./cube.js";

export const AXIAL_ZERO: Axial = { q: 0, r: 0 } as const;
export const AXIAL_DIRECTIONS: readonly Axial[] = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 },
] as const;

export function axial(q: number, r: number): Axial {
    return { q, r };
}

export function isAxial(value: unknown): value is Axial {
    return (
        typeof value === "object" &&
        value !== null &&
        "q" in value &&
        "r" in value &&
        typeof (value as { q: unknown }).q === "number" &&
        typeof (value as { r: unknown }).r === "number"
    );
}

export function equalAxial(a: Axial, b: Axial): boolean {
    return a.q === b.q && a.r === b.r;
}

export function addAxial(a: Axial, b: Axial): Axial {
    return axial(a.q + b.q, a.r + b.r);
}

export function subAxial(a: Axial, b: Axial): Axial {
    return axial(a.q - b.q, a.r - b.r);
}

export function scaleAxial(hex: Axial, factor: number): Axial {
    return axial(hex.q * factor, hex.r * factor);
}

export function axialDirection(dir: HexDirection): Axial {
    return AXIAL_DIRECTIONS[dir];
}

export function axialNeighbor(hex: Axial, dir: HexDirection): Axial {
    return addAxial(hex, axialDirection(dir));
}

export function getAxialNeighbours(hex: Axial) {
    return AXIAL_DIRECTIONS.map((d) => addAxial(hex, d));
}

export function axialRound(f: Axial): Axial {
    return cubeToAxial(cubeRound(axialToCube(f)));
}

export function stringifyAxial(axial: Axial): string {
    return `${axial.q},${axial.r}`;
}

export function parseAxial(s: string): Axial {
    const [q, r] = s.split(",").map(Number);
    return axial(q, r);
}
