import { minBy } from "../util/collections.js";
import { getTowersHeightMap } from "./castles.js";
import { getAxialNeighbours, stringifyAxial } from "./coords/axial.js";
import {
    addStackedAxial,
    equalStackedAxial,
    getUnstackedAxialNeighbours,
    parseStackedAxial,
    STACKED_AXIAL_UP,
    stackedAxial,
    stackedAxialDistance,
    stringifyStackedAxial,
} from "./coords/stacked-axial.js";
import { StackedAxial } from "./types.js";

export interface DijkstraResult {
    distanceMap: Map<string, number>;
    ancestorMap: Map<string, string | null>;
}

export function dijkstra(
    ground: StackedAxial[],
    towers: StackedAxial[],
    obstacles: StackedAxial[],
    source: StackedAxial,
    maxDistance = Number.POSITIVE_INFINITY,
): DijkstraResult {
    const towersHeightMap = getTowersHeightMap(towers);

    const world = new Set([...ground, ...towers].map(stringifyStackedAxial));
    const unvisited = new Set<string>(
        [...world.values()].filter(
            (w) =>
                w === stringifyStackedAxial(source) ||
                !obstacles.some((o) => stringifyStackedAxial(o) === w),
        ),
    );
    const distanceMap = new Map<string, number>(
        [...world.values()].map((w) => [w, Number.POSITIVE_INFINITY]),
    );
    distanceMap.set(stringifyStackedAxial(source), 0);
    const ancestorMap = new Map<string, string | null>([...world.values()].map((w) => [w, null]));

    while (unvisited.size > 0) {
        const currentKey = minBy(
            [...unvisited.values()],
            (s) => distanceMap.get(s)! + stackedAxialDistance(source, parseStackedAxial(s)),
        )!;
        const currentDist = distanceMap.get(currentKey)!;
        if (!Number.isFinite(currentDist) || currentDist > maxDistance) break;

        const currentAxial = parseStackedAxial(currentKey);
        const isInTower = towers.some((t) => equalStackedAxial(t, currentAxial));

        let unvisitedNeighbours: StackedAxial[] = [
            ...getUnstackedAxialNeighbours(currentAxial).filter((n) => {
                const towerHeight = towersHeightMap.get(stringifyAxial(n)) ?? 0;
                return n.h <= towerHeight;
            }),
        ];

        unvisitedNeighbours.push(
            ...getAxialNeighbours(currentAxial)
                .map((n) => {
                    const towerHeight = towersHeightMap.get(stringifyAxial(n)) ?? 0;
                    return stackedAxial(n.q, n.r, towerHeight);
                })
                .filter((c) => c.h < currentAxial.h),
        );

        if (!isInTower) {
            unvisitedNeighbours.push(
                ...getUnstackedAxialNeighbours(
                    addStackedAxial(currentAxial, STACKED_AXIAL_UP),
                ).filter((n) => {
                    const towerHeight = towersHeightMap.get(stringifyAxial(n)) ?? 0;
                    return n.h === towerHeight;
                }),
            );
        }

        unvisitedNeighbours = unvisitedNeighbours.filter((c) =>
            unvisited.has(stringifyStackedAxial(c)),
        );

        for (const unvisitedNeighbour of unvisitedNeighbours) {
            const towerHeight = towersHeightMap.get(stringifyAxial(unvisitedNeighbour)) ?? 0;
            const isTower = unvisitedNeighbour.h < towerHeight;

            const cost = isTower ? 0 : 1;
            const newDist = currentDist + cost;

            const oldDist = distanceMap.get(stringifyStackedAxial(unvisitedNeighbour))!;
            if (newDist < oldDist && newDist <= maxDistance) {
                distanceMap.set(stringifyStackedAxial(unvisitedNeighbour), newDist);
                ancestorMap.set(stringifyStackedAxial(unvisitedNeighbour), currentKey);
            }
        }

        unvisited.delete(currentKey);
    }

    return {
        distanceMap,
        ancestorMap,
    };
}

export function getPathFromDijkstra(
    to: StackedAxial,
    ancestorMap: DijkstraResult["ancestorMap"],
): StackedAxial[] | null {
    const path: StackedAxial[] = [];
    let ancestorKey: string | null = stringifyStackedAxial(to);
    if (!ancestorMap.get(ancestorKey)) {
        return null;
    }

    do {
        path.push(parseStackedAxial(ancestorKey!));
        ancestorKey = ancestorMap.get(ancestorKey!) ?? null;
    } while (ancestorKey);
    path.reverse();

    return path;
}
