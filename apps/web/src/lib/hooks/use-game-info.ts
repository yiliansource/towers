import { useAuthStore } from "../stores/auth.store";
import { useGameStore } from "../stores/game.store";
import { useLobbyStore } from "../stores/lobby.store";

export function useGameInfo() {
    const { user } = useAuthStore();
    const { lobby } = useLobbyStore();
    const { game, ui } = useGameStore();

    return {
        isHostUser: lobby?.host.id === user?.id,
        isInTurn: game?.ctx.currentPlayerId === user?.id,
    };
}
