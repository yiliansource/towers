import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/features/auth";
import { useLobbyStore } from "@/features/lobby";
import { useGameStore } from "../store/game.store";

export function useGamePageGuard() {
    const router = useRouter();

    const user = useAuthStore((s) => s.user);
    const userLoading = useAuthStore((s) => s.loading);

    const lobby = useLobbyStore((s) => s.lobby);
    const lobbyLoading = useLobbyStore((s) => s.loading);
    const clearLobby = useLobbyStore((s) => s.clearLobby);

    const game = useGameStore((s) => s.game);
    const gameLoading = useGameStore((s) => s.loading);

    useEffect(() => {
        if (lobbyLoading) return;

        if (!lobby) {
            router.push("/lobby");
            return;
        }

        if (lobby.state !== "INGAME") {
            clearLobby(true);
            router.push("/lobby");
        }
    }, [lobbyLoading, lobby, router, clearLobby]);

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
