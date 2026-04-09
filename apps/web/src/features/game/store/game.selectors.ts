import { GameState } from "@towers/shared/contracts";

export function selectIsInTurn(game: GameState | null, userId: string | null): boolean {
    if (!game || !userId) return false;
    return game.ctx.currentPlayerId === userId;
}
