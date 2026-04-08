"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { GamePerformActionPayload, GameState } from "@towers/shared/contracts/game";

import { useGameSocketContext } from "../providers/game-socket.provider";
import { useGameStore } from "../stores/game.store";
import { useLobbyStore } from "../stores/lobby.store";

export function useGameSocket() {
    const { socket, connected } = useGameSocketContext();
    const router = useRouter();

    const { resetGame, applySnapshot } = useGameStore();
    const resetLobby = useLobbyStore((s) => s.resetLobby);

    const [pendingAction, setPendingAction] = useState<GamePerformActionPayload>({ type: "none" });
    const [actionError, setActionError] = useState<string | null>(null);

    const runAction = useCallback(
        async <TResponse>(payload: GamePerformActionPayload): Promise<TResponse | null> => {
            if (!socket || !connected || pendingAction.type !== "none") return null;

            setPendingAction(payload);
            setActionError(null);

            try {
                // @ts-ignore
                const response = await socket.timeout(5000).emitWithAck("game.perform_action", payload);

                setPendingAction({ type: "none" });
                return response as TResponse;
            } catch (err) {
                setPendingAction({ type: "none" });
                console.error(err);
                setActionError("Request failed or timed out.");
                return null;
            }
        },
        [socket, connected, pendingAction.type],
    );

    useEffect(() => {
        if (!socket) return;

        const onGameUpdated = (snapshot: GameState) => {
            applySnapshot(snapshot);
        };
        const onGameFinished = async () => {
            resetLobby();
            resetGame();
            router.push("/lobby");
        };

        socket.on("game.finished", onGameFinished);
        socket.on("game.updated", onGameUpdated);

        return () => {
            socket.off("game.finished", onGameFinished);
        };
    }, [socket, router]);

    return {
        socket,
        connected,

        endTurn: () => void runAction({ type: "endTurn" }),
    };
}
