"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { LobbyErrorWsResponse, LobbyView } from "@towers/shared/contracts";

import { useLobbyStore } from "../store/lobby.store";
import { useLobbySocketContext } from "./lobby-socket.provider";

export function useLobbyEvents() {
    const { socket } = useLobbySocketContext();
    const router = useRouter();

    const setLobby = useLobbyStore((s) => s.setLobby);
    const clearLobby = useLobbyStore((s) => s.clearLobby);
    const setLobbyLoading = useLobbyStore((s) => s.setLoading);

    useEffect(() => {
        if (!socket) return;

        const onLobbyException = (error: LobbyErrorWsResponse) => {
            toast.error(error.code);
        };
        const onLobbyUpdated = (payload: LobbyView) => {
            setLobby(payload);
        };
        const onLobbyStarted = async () => {
            router.push("/game");

            clearLobby();
            setLobbyLoading(true);
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
    }, [socket, setLobby, router]);
}
