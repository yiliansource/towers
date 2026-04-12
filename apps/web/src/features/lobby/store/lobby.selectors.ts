import { LobbyStore } from "./lobby.store";

export function selectIsHostUser(userId: string | null) {
    return (store: LobbyStore) => !!userId && store.lobby?.host.id === userId;
}

export function selectUserColor(userId: string | null) {
    return (store: LobbyStore) =>
        store.lobby?.seats.find((s) => s.user?.id === userId)?.color ?? null;
}
