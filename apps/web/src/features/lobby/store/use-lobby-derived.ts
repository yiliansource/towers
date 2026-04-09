import { useAuthStore } from "@/features/auth";

import { selectIsHostUser } from "./lobby.selectors";
import { useLobbyStore } from "./lobby.store";

export function useIsHostUser() {
    const lobby = useLobbyStore((s) => s.lobby);
    const userId = useAuthStore((s) => s.user?.id ?? null);
    return selectIsHostUser(lobby, userId);
}
