import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useLobbyStore } from "../store/lobby.store";

export function useLobbyPageGuard() {
    const router = useRouter();

    const lobby = useLobbyStore((s) => s.lobby);
    const lobbyLoading = useLobbyStore((s) => s.loading);
    const clearLobby = useLobbyStore((s) => s.clearLobby);
    const setLobbyLoading = useLobbyStore((s) => s.setLoading);

    useEffect(() => {
        if (lobby && lobby.state !== "WAITING") {
            clearLobby();
            setLobbyLoading(true);

            router.push("/game");
        }
    }, [lobby, lobby?.state, router, clearLobby, setLobbyLoading]);

    const isAllowed = !lobbyLoading && !!lobby;
    const loading = lobbyLoading;

    return {
        isAllowed,
        loading,
    };
}
