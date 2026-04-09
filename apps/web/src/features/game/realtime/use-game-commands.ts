import { useCallback, useMemo } from "react";

import { StackedAxial } from "@towers/shared/hexgrid";

import { useGameSocketContext } from "./game-socket.provider";

export function useGameCommands() {
    const { socket } = useGameSocketContext();

    const placeKnight = useCallback(
        async (coord: StackedAxial) => {
            if (!socket) return;
            // @ts-ignore
            await socket.emitWithAck("game.place_knight", { coord });
        },
        [socket],
    );
    const endTurn = useCallback(async () => {
        if (!socket) return;
        await socket.emitWithAck("game.end_turn");
    }, [socket]);
    const abortGame = useCallback(async () => {
        if (!socket) return;
        await socket.timeout(5000).emitWithAck("game.abort_game");
    }, [socket]);

    return {
        placeKnight,
        endTurn,
        abortGame,
    };
}
