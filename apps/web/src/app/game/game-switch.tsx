"use client";

import { Spinner } from "@radix-ui/themes";
import { useWindowSize } from "@uidotdev/usehooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { GameSocketProvider } from "@/lib/providers/game-socket.provider";
import { useGameStore } from "@/lib/stores/game.store";
import { useLobbyStore } from "@/lib/stores/lobby.store";
import { createLogger } from "@/lib/util/logger";

import { GameScene } from "./components/game-scene";

const logger = createLogger("game-switch");

export function GameSwitch() {
    const { lobby, loading: lobbyLoading, hydrateLobby } = useLobbyStore();
    const { game, loading: gameLoading, hydrateGame } = useGameStore();

    const router = useRouter();

    const windowsize = useWindowSize();

    useEffect(() => {
        void hydrateLobby();
        void hydrateGame();
    }, []);

    useEffect(() => {
        if (lobbyLoading) return;

        if (!lobby) {
            logger.log("user not in lobby, rerouting");
            router.push("/lobby");
        } else if (lobby.state !== "INGAME") {
            logger.log("game not started, rerouting");
            router.push("/lobby");
        }
    }, [lobbyLoading, gameLoading, lobby, game]);

    if ((windowsize.width ?? 0) < 1024) {
        return (
            <div className="m-auto">
                <p>Small screens are not supported yet. Sorry!</p>
            </div>
        );
    }

    return lobbyLoading || gameLoading ? (
        <div className="m-auto">
            <Spinner />
        </div>
    ) : (
        <GameSocketProvider>
            <GameScene />
        </GameSocketProvider>
    );
}
