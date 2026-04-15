import { axial, hexToPixel, type StackedAxial } from "@towers/shared/hexgrid";

import * as THREE from "three";

export const HEX_HEIGHT = 0.55;

export function stackedToWorld(s: StackedAxial): THREE.Vector3 {
    const [x, y] = hexToPixel(axial(s.q, s.r));
    return new THREE.Vector3(x, s.h * HEX_HEIGHT, y);
}
