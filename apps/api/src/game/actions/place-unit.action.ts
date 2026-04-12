import { GameState } from "@towers/shared/contracts";
import {
    AXIAL_ZERO,
    axial,
    axialDirection,
    axialRotateAroundCenter,
    axialToStacked,
    equalStackedAxial,
    getAxialNeighbours,
    getTowersHeightMap,
    StackedAxial,
    scaleAxial,
    stringifyAxial,
    stringifyStackedAxial,
} from "@towers/shared/hexgrid";
import { uniqueBy } from "@towers/shared/util";

export function getAllowedPlaceUnitFields(gameState: GameState, userId: string): StackedAxial[] {
    if (gameState.context.phase === "SETUP") {
        return axialRotateAroundCenter(scaleAxial(axialDirection(0), 3), AXIAL_ZERO)
            .map((a) => axialToStacked(a, 1))
            .filter(
                (s) =>
                    !Object.values(gameState.boardState.units)
                        .flat()
                        .some((b) => equalStackedAxial(s, b)),
            );
    } else if (gameState.context.phase === "PLAYING") {
        const towerHeightMap = getTowersHeightMap(gameState.boardState.towers);
        const units = [
            gameState.boardState.king,
            ...Object.values(gameState.boardState.units).flat(),
        ];

        return uniqueBy(
            gameState.boardState.units[userId].flatMap((c) =>
                getAxialNeighbours(axial(c.q, c.r))
                    .map((a) => axialToStacked(a, towerHeightMap.get(stringifyAxial(a)) ?? 0))
                    .filter((n) => n.h <= c.h)
                    .filter((n) => !units.some((u) => equalStackedAxial(n, u))),
            ),
            stringifyStackedAxial,
        );
    }

    return [];
}
