import { GameActionSubmitPayload } from "@towers/shared/contracts";

import { useCallback } from "react";

import { useGameSocketContext } from "./game-socket.provider";

export function useGameCommands() {
    const { socket } = useGameSocketContext();

    const endTurn = useCallback(async () => {
        if (!socket) return;
        await socket.timeout(5000).emitWithAck("game.end_turn");
    }, [socket]);
    const abortGame = useCallback(async () => {
        if (!socket) return;
        await socket.timeout(5000).emitWithAck("game.abort_game");
    }, [socket]);

    const submitAction = useCallback(
        async (payload: GameActionSubmitPayload) => {
            if (!socket) return;
            // @ts-expect-error
            await socket.timeout(5000).emitWithAck("game.submit_action", payload);
        },
        [socket],
    );

    return {
        endTurn,
        abortGame,

        submitAction,
    };
}
