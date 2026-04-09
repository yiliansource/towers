import { addAxial, axial } from "../coords/axial.js";
import type { Axial } from "../types.js";

export function axialRange(center: Axial, n: number): Axial[] {
    const results: Axial[] = [];
    for (let q = -n; q <= n; q++) {
        for (let r = Math.max(-n, -q - n); r <= Math.min(n, -q + n); r++) {
            results.push(addAxial(center, axial(q, r)));
        }
    }
    return results;
}
