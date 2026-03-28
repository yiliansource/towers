import { z } from "zod";

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
    towers: z.record(z.string(), z.object({})),
});

export type GameState = z.infer<typeof GameStateSchema>;
