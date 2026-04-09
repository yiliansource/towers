"use client";

import { Spinner } from "@radix-ui/themes";
import { useWindowSize } from "@uidotdev/usehooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createLogger } from "@/common/util/logger";
import { useAuthStore } from "@/features/auth";
import { GameScene, GameSocketProvider, useGameStore, useHydrateGameOnMount } from "@/features/game";
import { useHydrateLobbyOnMount, useLobbyStore } from "@/features/lobby";

const logger = createLogger("game-page");

export default function GamePage() {
    useHydrateLobbyOnMount();
    useHydrateGameOnMount();

    const user = useAuthStore((s) => s.user);
    const userLoading = useAuthStore((s) => s.loading);

    const lobby = useLobbyStore((s) => s.lobby);
    const lobbyLoading = useLobbyStore((s) => s.loading);
    const clearLobby = useLobbyStore((s) => s.clearLobby);

    const router = useRouter();
    const windowSize = useWindowSize();

    const game = useGameStore((s) => s.game);
    const gameLoading = useGameStore((s) => s.loading);

    const loading = userLoading || lobbyLoading || gameLoading;

    useEffect(() => {
        if (loading) return;

        if (!lobby) {
            logger.log("user not in lobby, rerouting");
            router.push("/lobby");
        } else if (!game && lobby.state !== "INGAME") {
            logger.log("game not started, rerouting");

            clearLobby(true);
            router.push("/lobby");
        }
    }, [loading, lobby, game]);

    if (userLoading || lobbyLoading || gameLoading) {
        return (
            <div className="m-auto">
                <Spinner />
            </div>
        );
    }

    if (!user || !lobby || !game) {
        return null;
    }

    if ((windowSize.width ?? 0) < 1024) {
        return (
            <div className="m-auto">
                <p>Small screens are not supported yet. Sorry!</p>
            </div>
        );
    }

    return (
        <GameSocketProvider>
            <GameScene />
        </GameSocketProvider>
    );
}
