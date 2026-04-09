import { useAuthStore } from "@/features/auth";

import { selectIsInTurn } from "./game.selectors";
import { useGameStore } from "./game.store";

export function useIsInTurn() {
    const game = useGameStore((s) => s.game);
    const userId = useAuthStore((s) => s.user?.id ?? null);
    return selectIsInTurn(game, userId);
}
