"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LobbyView } from "@towers/shared/contracts/lobby";

import { useLobbySocketContext } from "@/lib/providers/lobby-socket.provider";
import { useLobbyStore } from "@/lib/stores/lobby.store";

export function useLobbySocket() {
    const { socket, connected } = useLobbySocketContext();
    const router = useRouter();

    const setLobby = useLobbyStore((s) => s.setLobby);
    const resetLobby = useLobbyStore((s) => s.resetLobby);

    useEffect(() => {
        if (!socket) return;

        const onLobbyUpdated = (payload: LobbyView) => {
            setLobby(payload);
        };
        const onLobbyStarted = async () => {
            resetLobby();
            router.push("/game");
        };

        socket.on("lobby.updated", onLobbyUpdated);
        socket.on("lobby.game_started", onLobbyStarted);

        return () => {
            socket.off("lobby.updated", onLobbyUpdated);
            socket.off("lobby.game_started", onLobbyStarted);
        };
    }, [socket, setLobby, router]);

    return {
        socket,
        connected,

        leaveLobby: async () => {
            await socket?.emitWithAck("lobby.leave");
            setLobby(null);
        },
        messageLobby: (message: string) => socket?.emit("lobby.message", { message }),
        switchSlot: (slot: number) => socket?.emit("lobby.switch_slot", { slot }),
        startGame: () => socket?.emit("lobby.start_game"),
    };
}
