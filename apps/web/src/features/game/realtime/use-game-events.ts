"use client";

import type { GameSnapshot, LobbyView } from "@towers/shared/contracts";

import { useHydrateLobby, useLobbyStore } from "@/features/lobby";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useGameStore } from "../store/game.store";
import { useGameSocketContext } from "./game-socket.provider";

export function useGameEvents() {
    const { socket } = useGameSocketContext();
    const router = useRouter();

    const applySnapshot = useGameStore((s) => s.applySnapshot);
    const clearGame = useGameStore((s) => s.clearGame);

    const setLobby = useLobbyStore((s) => s.setLobby);
    const clearLobby = useLobbyStore((s) => s.clearLobby);
    const hydrateLobby = useHydrateLobby();

    useEffect(() => {
        if (!socket) return;

        const onLobbyUpdated = (payload: LobbyView) => {
            setLobby(payload);
        };

        const onGameUpdated = (snapshot: GameSnapshot) => {
            applySnapshot(snapshot);
        };
        const onGameFinished = async () => {
            clearLobby();
            hydrateLobby();
            clearGame();

            router.push("/lobby");
        };

        socket.on("game.updated", onGameUpdated);
        socket.on("game.lobby_updated", onLobbyUpdated);
        socket.on("game.finished", onGameFinished);

        socket.connect();

        return () => {
            socket.off("game.finished", onGameFinished);
        };
    }, [socket, router, setLobby, applySnapshot, clearLobby, hydrateLobby, clearGame]);
}
