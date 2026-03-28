"use client";

import { Spinner } from "@radix-ui/themes";

import { LobbySocketProvider } from "@/lib/providers/lobby-socket.provider";
import { useLobbyStore } from "@/lib/stores/lobby.store";

import { LobbyCreateJoinForm } from "./components/lobby-create-join-form";
import { LobbyScreen } from "./components/lobby-screen";

export function LobbySwitch() {
    const { lobby, loading } = useLobbyStore();

    return loading ? (
        <Spinner />
    ) : !lobby ? (
        <LobbyCreateJoinForm />
    ) : (
        <LobbySocketProvider>
            <LobbyScreen />
        </LobbySocketProvider>
    );
}
