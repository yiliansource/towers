"use client";

import { useEffect } from "react";

import { getGame } from "../api/game-actions";
import { useGameStore } from "../store/game.store";

export function useHydrateGameOnMount() {
    const setGame = useGameStore((s) => s.setGame);
    const clearGame = useGameStore((s) => s.clearGame);
    const setLoading = useGameStore((s) => s.setLoading);

    useEffect(() => {
        (async function () {
            try {
                setLoading(true);

                const game = await getGame();
                setGame(game);
            } catch {
                clearGame();
            } finally {
                setLoading(false);
            }
        })();
    }, []);
}
