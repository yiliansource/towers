"use client";

import { useEffect } from "react";

import { getLobby } from "../api/lobby-actions";
import { useLobbyStore } from "../store/lobby.store";

export function useHydrateLobbyOnMount() {
    const setLobby = useLobbyStore((s) => s.setLobby);
    const clearLobby = useLobbyStore((s) => s.clearLobby);
    const setLoading = useLobbyStore((s) => s.setLoading);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);

                const lobby = await getLobby();
                if (lobby) setLobby(lobby);
            } catch {
                clearLobby();
            } finally {
                setLoading(false);
            }
        })();
    }, [setLobby, setLoading, clearLobby]);
}
