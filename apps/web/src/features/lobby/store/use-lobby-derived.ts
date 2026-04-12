import { useAuthStore } from "@/features/auth";

import { selectIsHostUser, selectUserColor } from "./lobby.selectors";
import { useLobbyStore } from "./lobby.store";

export function useIsHostUser() {
    const userId = useAuthStore((s) => s.user?.id ?? null);
    return useLobbyStore(selectIsHostUser(userId));
}

export function usePlayerColor(userId: string) {
    return useLobbyStore(selectUserColor(userId));
}
