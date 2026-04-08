import { Axial } from "../types.js";
import { HEX_SIZE } from "./constants.js";

export function hexToPixel(hex: Axial): [number, number] {
    const x = Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r;
    const y = (3 / 2) * hex.r;

    return [x * HEX_SIZE, y * HEX_SIZE];
}
