"use client";

import { Spinner } from "@radix-ui/themes";
import { useEffect } from "react";

import { TowersBanner } from "@/components/towers-banner";
import { hydrateLobby } from "@/lib/hydrate-lobby";
import { useLobbyStore } from "@/stores/lobby.store";

import { LobbyCreateJoinForm } from "./components/lobby-create-join-form";
import { LobbyScreen } from "./components/lobby-screen";

export default function LobbyPage() {
    const { lobby, loading } = useLobbyStore();

    useEffect(() => {
        void hydrateLobby();
    }, []);

    return (
        <div className="m-auto flex flex-col items-center">
            <TowersBanner className="mb-10" />
            {loading ? <Spinner /> : !lobby ? <LobbyCreateJoinForm /> : <LobbyScreen />}
        </div>
    );
}
