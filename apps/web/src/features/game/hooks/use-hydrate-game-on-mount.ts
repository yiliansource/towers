"use client";

import { waitFor } from "@towers/shared/util";

import { useAuthStore } from "@/features/auth";

import { useEffect } from "react";

import { getGame } from "../api/game-actions";
import { useGameStore } from "../store/game.store";

export function useHydrateGameOnMount() {
    const applySnapshot = useGameStore((s) => s.applySnapshot);
    const clearGame = useGameStore((s) => s.clearGame);
    const setLoading = useGameStore((s) => s.setLoading);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);

                const snapshot = await getGame();
                await waitFor(() => !useAuthStore.getState().loading);

                if (snapshot) applySnapshot(snapshot);
            } catch {
                clearGame();
            } finally {
                setLoading(false);
            }
        })();
    }, [setLoading, applySnapshot, clearGame]);
}
