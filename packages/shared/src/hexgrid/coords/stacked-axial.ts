import type { Axial, StackedAxial } from "../types.js";

export const STACKED_AXIAL_ZERO: StackedAxial = { q: 0, r: 0, h: 0 } as const;
export const STACKED_AXIAL_UP: StackedAxial = { q: 0, r: 0, h: 1 } as const;
export const STACKED_AXIAL_DOWN: StackedAxial = { q: 0, r: 0, h: -1 } as const;

export const STACKED_AXIAL_DIRECTIONS: readonly StackedAxial[] = [
    { q: 1, r: 0, h: 0 },
    { q: 1, r: 0, h: 0 },
    { q: 1, r: -1, h: 0 },
    { q: 0, r: -1, h: 0 },
    { q: -1, r: 0, h: 0 },
    { q: -1, r: 1, h: 0 },
    { q: 0, r: 1, h: 0 },
    { q: 0, r: 0, h: 1 },
    { q: 0, r: 0, h: -1 },
] as const;

export function stackedAxial(q: number, r: number, h: number): StackedAxial {
    return { q, r, h };
}

export function isStackedAxial(value: unknown): value is StackedAxial {
    return (
        typeof value === "object" &&
        value !== null &&
        "q" in value &&
        "r" in value &&
        "h" in value &&
        typeof (value as { q: unknown }).q === "number" &&
        typeof (value as { r: unknown }).r === "number" &&
        typeof (value as { h: unknown }).h === "number"
    );
}

export function axialToStacked(a: Axial, h: number): StackedAxial {
    return stackedAxial(a.q, a.r, h);
}

export function equalStackedAxial(a: StackedAxial, b: StackedAxial): boolean {
    return a.q === b.q && a.r === b.r && a.h === b.h;
}

export function addStackedAxial(a: StackedAxial, b: StackedAxial): StackedAxial {
    return stackedAxial(a.q + b.q, a.r + b.r, a.h + b.h);
}

export function subStackedAxial(a: StackedAxial, b: StackedAxial): StackedAxial {
    return stackedAxial(a.q - b.q, a.r - b.r, a.h - b.h);
}

export function scaleStackedAxial(a: StackedAxial, factor: number): StackedAxial {
    return stackedAxial(a.q * factor, a.r * factor, a.h * factor);
}

export function stringifyStackedAxial(a: StackedAxial) {
    return `${a.q},${a.r},${a.h}`;
}
export function parseStackedAxial(s: string): StackedAxial {
    const [q, r, h] = s.split(",").map(Number);
    return stackedAxial(q, r, h);
}
