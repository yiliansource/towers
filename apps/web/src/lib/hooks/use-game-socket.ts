"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useGameSocketContext } from "../providers/game-socket.provider";
import { useGameStore } from "../stores/game.store";
import { useLobbyStore } from "../stores/lobby.store";

export function useGameSocket() {
    const { socket, connected } = useGameSocketContext();
    const router = useRouter();

    const resetGame = useGameStore((s) => s.resetGame);
    const resetLobby = useLobbyStore((s) => s.resetLobby);

    useEffect(() => {
        if (!socket) return;

        const onGameUpdated = () => {};
        const onGameFinished = async () => {
            resetLobby();
            resetGame();
            router.push("/lobby");
        };

        socket.on("game.finished", onGameFinished);

        return () => {
            socket.off("game.finished", onGameFinished);
        };
    }, [socket, router]);

    return {
        socket,
        connected,

        finishGame: () => socket?.emit("game.finish"),
    };
}
