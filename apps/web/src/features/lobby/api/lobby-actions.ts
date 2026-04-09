import { LobbyView } from "@towers/shared/contracts";

import { fetchApi } from "@/common/util/fetch-api";

export async function getLobby(): Promise<LobbyView | null> {
    const res = await fetchApi("/lobby");
    if (!res.ok) return null;
    return (await res.json()) as LobbyView;
}

export async function createLobby() {
    const res = await fetchApi("/lobby/create", { method: "POST" });
    if (!res.ok) return null;

    return (await res.json()) as LobbyView;
}

export async function joinLobby(lobbyId: string) {
    const res = await fetchApi(`/lobby/join/${lobbyId}`, { method: "POST" });
    if (!res.ok) return null;

    return (await res.json()) as LobbyView;
}
