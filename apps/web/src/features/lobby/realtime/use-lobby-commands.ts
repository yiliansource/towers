"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { SlotColor } from "@towers/shared/contracts";

import { useAuthStore } from "@/features/auth";

import { useLobbyStore } from "../store/lobby.store";
import { useLobbySocketContext } from "./lobby-socket.provider";

export function useLobbyCommands() {
    const { socket } = useLobbySocketContext();
    const router = useRouter();

    const user = useAuthStore((s) => s.user!);
    const lobby = useLobbyStore((s) => s.lobby);
    const clearLobby = useLobbyStore((s) => s.clearLobby);

    const leaveLobby = useCallback(async () => {
        if (!socket) return;
        await socket.emitWithAck("lobby.leave");
        clearLobby();
        router.push("/");
    }, [socket, clearLobby, router]);

    const messageLobby = useCallback(
        async (message: string) => {
            if (!socket || !lobby) return;

            // @ts-ignore
            await socket.timeout(5000).emitWithAck("lobby.message", { message });
        },
        [socket, lobby],
    );

    const chooseColor = useCallback(
        async (color: SlotColor) => {
            if (!socket || !lobby) return;

            // @ts-ignore
            await socket.timeout(5000).emitWithAck("lobby.choose_color", { color });
        },
        [socket, lobby],
    );

    const switchSlot = useCallback(
        async (slot: number) => {
            if (!socket || !lobby) return;

            const seat = lobby.seats.find((s) => s.slot === slot);
            if (!seat || !!seat.user) return;

            // @ts-ignore
            await socket.timeout(5000).emitWithAck("lobby.switch_slot", { slot });
        },
        [socket, lobby, lobby?.seats],
    );
    const kickSlot = useCallback(
        async (slot: number) => {
            if (!socket || !lobby) return;

            const seat = lobby.seats.find((s) => s.slot === slot);
            if (!seat || !seat.user || seat.user.id === user.id) return;

            // @ts-ignore
            await socket.timeout(5000).emitWithAck("lobby.kick_slot", { slot });
        },
        [socket, lobby, lobby?.seats],
    );
    const promoteSlot = useCallback(
        async (slot: number) => {
            if (!socket || !lobby) return;

            const seat = lobby.seats.find((s) => s.slot === slot);
            if (!seat || !seat.user || seat.user.id === user.id) return;

            // @ts-ignore
            await socket.timeout(5000).emitWithAck("lobby.promote_slot", { slot });
        },
        [socket, lobby, lobby?.seats],
    );

    const startGame = useCallback(async () => {
        if (!socket) return;
        await socket.timeout(5000).emitWithAck("lobby.start_game");
    }, [socket]);

    return {
        leaveLobby,
        messageLobby,
        chooseColor,

        switchSlot,
        kickSlot,
        promoteSlot,

        startGame,
    };
}
