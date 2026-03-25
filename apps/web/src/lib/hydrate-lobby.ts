import { LobbyView } from "@towers/shared/contracts/lobby";

import { fetchApi } from "@/lib/api";
import { useLobbyStore } from "@/stores/lobby.store";

export async function hydrateLobby() {
    try {
        useLobbyStore.getState().setLoading(true);

        const res = await fetchApi("/lobby/current");
        if (!res.ok) {
            throw new Error();
        }

        const lobby = (await res.json()) as LobbyView;
        useLobbyStore.getState().setLobby(lobby);
    } catch {
        useLobbyStore.getState().setLobby(null);
    }
    useLobbyStore.getState().setLoading(false);
}
