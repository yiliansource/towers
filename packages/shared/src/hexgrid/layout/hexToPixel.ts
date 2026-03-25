import { Axial } from "../types.js";

const SIZE = 1;

// flat
export function hexToPixel(hex: Axial) {
    let x = (3 / 2) * hex.q;
    var y = (Math.sqrt(3) / 2) * hex.q + Math.sqrt(3) * hex.r;
    x = x * SIZE;
    y = y * SIZE;
    return [x, y];
}
