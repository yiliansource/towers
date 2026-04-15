import { AXIAL_ZERO, stringifyAxial } from "./coords/axial.js";
import {
    addStackedAxial,
    STACKED_AXIAL_DIRECTIONS,
    stackedAxial,
    stringifyStackedAxial,
} from "./coords/stacked-axial.js";
import { axialRange } from "./math/range.js";
import { StackedAxial } from "./types.js";

export function getCastles(towers: StackedAxial[]): StackedAxial[][] {
    const coordMap = new Map<string, StackedAxial>();
    for (const coord of towers) {
        coordMap.set(stringifyStackedAxial(coord), coord);
    }

    const visited = new Set<string>();
    const components: StackedAxial[][] = [];

    for (const start of towers) {
        const startKey = stringifyStackedAxial(start);
        if (visited.has(startKey)) continue;

        const component: StackedAxial[] = [];
        const stack = [start];
        visited.add(startKey);

        while (stack.length > 0) {
            const current = stack.pop()!;
            component.push(current);

            for (const neighbour of STACKED_AXIAL_DIRECTIONS.map((d) =>
                addStackedAxial(current, d),
            )) {
                const neighbourKey = stringifyStackedAxial(neighbour);

                // only follow neighbours that are actually in the input set
                if (!coordMap.has(neighbourKey)) continue;
                if (visited.has(neighbourKey)) continue;

                visited.add(neighbourKey);
                stack.push(coordMap.get(neighbourKey)!);
            }
        }

        components.push(component);
    }

    return components;
}

export function getTowersHeightMap(towers: StackedAxial[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const tower of towers) {
        const key = stringifyAxial(tower);
        const maxH = Math.max(map.get(key) ?? 0, tower.h + 1);
        map.set(key, maxH);
    }
    return map;
}

export function getGroundCoordinates(towers: StackedAxial[], worldRadius: number): StackedAxial[] {
    const towersHeightMap = getTowersHeightMap(towers);
    return axialRange(AXIAL_ZERO, worldRadius).map((a) =>
        stackedAxial(a.q, a.r, towersHeightMap.get(stringifyAxial(a)) ?? 0),
    );
}
