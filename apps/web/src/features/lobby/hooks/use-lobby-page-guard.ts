import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLobbyStore } from "../store/lobby.store";

export function useLobbyPageGuard() {
    const router = useRouter();

    const lobby = useLobbyStore((s) => s.lobby);
    const lobbyLoading = useLobbyStore((s) => s.loading);
    const clearLobby = useLobbyStore((s) => s.clearLobby);

    useEffect(() => {
        if (lobby && lobby.state !== "WAITING") {
            clearLobby(true);
            router.push("/game");
        }
    }, [lobby, lobby?.state, router.push, clearLobby]);

    const isAllowed = !lobbyLoading && !!lobby;
    const loading = lobbyLoading;

    return {
        isAllowed,
        loading,
    };
}
