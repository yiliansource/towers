"use client";

import { Spinner } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useGameStore } from "@/lib/stores/game.store";
import { useLobbyStore } from "@/lib/stores/lobby.store";

import { GameScene } from "./components/game-scene";

export function GameSwitch() {
    const { lobby, loading: lobbyLoading } = useLobbyStore();
    const { game, loading: gameLoading } = useGameStore();

    const router = useRouter();

    // console.log(lobby, lobbyLoading);
    // console.log(game, gameLoading);

    useEffect(() => {
        if ((!lobbyLoading && !lobby) || (!lobbyLoading && lobby && lobby.state !== "INGAME")) {
            router.push("/lobby");
        }
    }, [lobbyLoading, gameLoading, lobby, game]);

    return lobbyLoading || gameLoading ? <Spinner /> : <GameScene />;
}
