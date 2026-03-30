import { z } from "zod";

export interface GameServerToClientEvents {
    "game.finished": () => void;
}

export interface GameClientToServerEvents {
    "game.finish": () => void;
}

export const GamePhase = {
    SETUP: "SETUP",
    PLAYING: "PLAYING",
    FINISHED: "FINISHED",
} as const;
export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

export const GameStateSchema = z.object({
    gameId: z.string(),
    phase: z.enum(GamePhase),
    turn: z.number(),
    activePlayerId: z.string(),
    towers: z.array(z.string()),
});

export type GameState = z.infer<typeof GameStateSchema>;
