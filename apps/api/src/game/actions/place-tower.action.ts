import { GameState } from "@towers/shared/contracts";
import {
    axial,
    equalStackedAxial,
    getCastles,
    getStackedAxialNeighbours,
    getTowersHeightMap,
    parseStackedAxial,
    StackedAxial,
    stringifyAxial,
    stringifyStackedAxial,
} from "@towers/shared/hexgrid";
import { uniqueBy } from "@towers/shared/util";

export function getAllowedPlaceTowerFields(
    gameState: GameState,
    _playerId: string,
): StackedAxial[] {
    if (gameState.context.phase === "PLAYING") {
        const units = [
            gameState.boardState.king,
            ...Object.values(gameState.boardState.units).flat(),
        ];
        const heightmap = getTowersHeightMap(gameState.boardState.towers);

        const occurrenceMap = new Map<string, number>();
        const castles = getCastles(gameState.boardState.towers);
        for (const castle of castles) {
            const baseSize = castle.filter((c) => c.h === 0).length;
            // const height = Math.max(...castle.map((c) => c.h));

            const shell = uniqueBy(
                castle
                    .flatMap((c) => getStackedAxialNeighbours(c))
                    .filter(
                        (d) =>
                            d.h === (heightmap.get(stringifyAxial(axial(d.q, d.r))) ?? 0) &&
                            d.h >= 0 &&
                            d.h < baseSize &&
                            !castle.some((c) => equalStackedAxial(d, c)),
                    ),
                stringifyStackedAxial,
            ).filter((s) => !units.some((u) => equalStackedAxial(s, u)));

            for (const s of shell) {
                const key = stringifyStackedAxial(s);
                const count = occurrenceMap.get(key) ?? 0;
                occurrenceMap.set(key, count + 1);
            }
        }

        return [...occurrenceMap.entries()]
            .filter(([_, v]) => v <= 1)
            .map(([k, _]) => parseStackedAxial(k));
    }

    return [];
}
