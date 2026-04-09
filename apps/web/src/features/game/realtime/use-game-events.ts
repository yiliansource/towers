"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { GameState, LobbyView } from "@towers/shared/contracts";

import { useLobbyStore } from "@/features/lobby";

import { useGameStore } from "../store/game.store";
import { useGameSocketContext } from "./game-socket.provider";

export function useGameEvents() {
    const { socket } = useGameSocketContext();
    const router = useRouter();

    const setGame = useGameStore((s) => s.setGame);
    const clearGame = useGameStore((s) => s.clearGame);

    const setLobby = useLobbyStore((s) => s.setLobby);
    const clearLobby = useLobbyStore((s) => s.clearLobby);

    useEffect(() => {
        if (!socket) return;

        const onLobbyUpdated = (payload: LobbyView) => {
            setLobby(payload);
        };

        socket.on("lobby.updated", onLobbyUpdated);

        const onGameUpdated = (game: GameState) => {
            setGame(game);
        };
        const onGameFinished = async () => {
            clearLobby(true);
            clearGame();

            router.push("/lobby");
        };

        socket.on("game.finished", onGameFinished);
        socket.on("game.updated", onGameUpdated);

        return () => {
            socket.off("game.finished", onGameFinished);
        };
    }, [socket, router]);
}
