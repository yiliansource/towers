import { useAuthStore } from "@/features/auth";
import { useLobbyStore } from "@/features/lobby";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useGameStore } from "../store/game.store";

export function useGamePageGuard() {
    const router = useRouter();

    const user = useAuthStore((s) => s.user);
    const userLoading = useAuthStore((s) => s.loading);

    const lobby = useLobbyStore((s) => s.lobby);
    const lobbyLoading = useLobbyStore((s) => s.loading);
    const clearLobby = useLobbyStore((s) => s.clearLobby);
    const setLobbyLoading = useLobbyStore((s) => s.setLoading);

    const game = useGameStore((s) => s.boardState);
    const gameLoading = useGameStore((s) => s.loading);

    useEffect(() => {
        if (lobbyLoading) return;

        if (!lobby) {
            router.push("/lobby");
            return;
        }

        if (lobby.state !== "INGAME") {
            clearLobby();
            setLobbyLoading(true);

            router.push("/lobby");
        }
    }, [lobbyLoading, lobby, router, clearLobby, setLobbyLoading]);

    const isAllowed =
        !userLoading &&
        !!user &&
        !lobbyLoading &&
        !!lobby &&
        lobby.state === "INGAME" &&
        !gameLoading &&
        !!game;
    const loading = userLoading || lobbyLoading || gameLoading;

    return {
        isAllowed,
        loading,
    };
}
