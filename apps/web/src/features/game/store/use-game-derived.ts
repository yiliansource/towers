import { useAuthStore } from "@/features/auth";

import {
    selectCurrentAction,
    selectCurrentActionStep,
    selectIsInTurn,
    selectPlayerResources,
} from "./game.selectors";
import { useGameStore } from "./game.store";

export function useIsInTurn() {
    const userId = useAuthStore((s) => s.user?.id ?? null);
    return useGameStore(selectIsInTurn(userId));
}

export function useCurrentAction() {
    return useGameStore(selectCurrentAction);
}

export function useCurrentActionStep() {
    return useGameStore(selectCurrentActionStep);
}

export function usePlayerResources() {
    const userId = useAuthStore((s) => s.user?.id ?? null);
    return useGameStore(selectPlayerResources(userId));
}
