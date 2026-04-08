import { axialToCube, cubeToAxial } from "../coords/convert.js";
import { addCube, cube, rotateCubeLeft, subCube } from "../coords/cube.js";
import { Axial } from "../types.js";

export function axialRotateAroundCenter(pos: Axial, center: Axial): Axial[] {
    const posCube = axialToCube(pos);
    const centerCube = axialToCube(center);

    let vec = subCube(posCube, centerCube);
    let results: Axial[] = [];
    for (let i = 0; i < 6; i++) {
        results.push(cubeToAxial(addCube(vec, centerCube)));
        vec = rotateCubeLeft(vec);
    }

    return results;
}
