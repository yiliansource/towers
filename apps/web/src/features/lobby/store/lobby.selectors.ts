import type { LobbyView } from "@towers/shared/contracts";

export function selectIsHostUser(lobby: LobbyView | null, userId: string | null): boolean {
    if (!lobby || !userId) return false;
    return lobby.host.id === userId;
}
