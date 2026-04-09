import { axial, axialRound } from "../coords/axial.js";
import type { Axial } from "../types.js";
import { HEX_SIZE } from "./constants.js";

export function pixelToHex([x, y]: [number, number]): Axial {
    const nx = x / HEX_SIZE;
    const ny = y / HEX_SIZE;

    const q = (Math.sqrt(3) / 3) * nx - (1 / 3) * ny;
    const r = (2 / 3) * ny;

    return axialRound(axial(q, r));
}
