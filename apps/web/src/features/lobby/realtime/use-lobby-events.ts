"use client";

import type { LobbyErrorWsResponse, LobbyView } from "@towers/shared/contracts";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { useHydrateLobby } from "../hooks/use-hydrate";
import { useLobbyStore } from "../store/lobby.store";
import { useLobbySocketContext } from "./lobby-socket.provider";

export function useLobbyEvents() {
    const { socket } = useLobbySocketContext();
    const router = useRouter();

    const lobby = useLobbyStore((s) => s.lobby);
    const setLobby = useLobbyStore((s) => s.setLobby);
    const clearLobby = useLobbyStore((s) => s.clearLobby);
    const hydrateLobby = useHydrateLobby();

    useEffect(() => {
        if (!socket || !lobby) return;

        socket.connect();

        const onLobbyException = (error: LobbyErrorWsResponse) => {
            toast.error(error.code);
        };
        const onLobbyUpdated = (payload: LobbyView) => {
            setLobby(payload);
        };
        const onLobbyStarted = async () => {
            router.push("/game");

            clearLobby();
            hydrateLobby();
        };
        const onLobbyRemoved = () => {
            clearLobby();

            toast("LOBBY_REMOVED");
        };

        socket.on("exception", onLobbyException);

        socket.on("lobby.updated", onLobbyUpdated);
        socket.on("lobby.game_started", onLobbyStarted);
        socket.on("lobby.removed", onLobbyRemoved);

        return () => {
            socket.off("exception", onLobbyException);

            socket.off("lobby.updated", onLobbyUpdated);
            socket.off("lobby.game_started", onLobbyStarted);
            socket.off("lobby.removed", onLobbyRemoved);
        };
    }, [lobby, socket, router, setLobby, hydrateLobby, clearLobby]);
}
