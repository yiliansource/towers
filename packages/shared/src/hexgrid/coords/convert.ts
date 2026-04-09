import type { Axial, Cube } from "../types.js";
import { axial } from "./axial.js";
import { cube } from "./cube.js";

export function axialToCube(hex: Axial) {
    return cube(hex.q, hex.r, -hex.q - hex.r);
}

export function cubeToAxial(cube: Cube) {
    return axial(cube.q, cube.r);
}
