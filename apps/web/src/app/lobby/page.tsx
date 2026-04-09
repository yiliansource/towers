"use client";

import { Spinner } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createLogger } from "@/common/util/logger";
import {
    LobbyEntryScreen,
    LobbyScreen,
    LobbySocketProvider,
    useHydrateLobbyOnMount,
    useLobbyEvents,
    useLobbyStore,
} from "@/features/lobby";

const logger = createLogger("lobby-page");

export default function LobbyPage() {
    useHydrateLobbyOnMount();

    const lobby = useLobbyStore((s) => s.lobby);
    const loading = useLobbyStore((s) => s.loading);
    const clearLobby = useLobbyStore((s) => s.clearLobby);

    const router = useRouter();

    useEffect(() => {
        if (lobby && lobby.state !== "WAITING") {
            logger.log("game already started, rerouting");

            clearLobby(true);
            router.push("/game");
        }
    }, [lobby, lobby?.state]);

    if (loading) {
        return (
            <div className="m-auto">
                <Spinner />
            </div>
        );
    }

    if (!lobby) {
        return <LobbyEntryScreen />;
    }

    return (
        <LobbySocketProvider>
            <LobbyScreen />
        </LobbySocketProvider>
    );
}
