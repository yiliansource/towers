"use client";

import { Spinner } from "@radix-ui/themes";
import { useEffect } from "react";

import { hydrateLobby } from "@/lib/hydrate-lobby";
import { useLobbyStore } from "@/stores/lobby.store";

import { LobbyCreateJoinForm } from "./components/lobby-create-join-form";
import { LobbyScreen } from "./components/lobby-screen";

export function LobbySwitch() {
    const { lobby, loading } = useLobbyStore();

    useEffect(() => {
        void hydrateLobby();
    }, []);

    return loading ? <Spinner /> : !lobby ? <LobbyCreateJoinForm /> : <LobbyScreen />;
}
