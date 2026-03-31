import { z } from "zod";

export interface GameServerToClientEvents {
    "game.finished": () => void;
}

export interface GameClientToServerEvents {
    "game.finish": () => void;
}

export const GamePlayerSchema = z.object({
    id: z.string(),
    username: z.string(),
    points: z.number(),
});
export type GamePlayer = z.infer<typeof GamePlayerSchema>;

export const GameContextSchema = z.object({
    turn: z.number(),
    currentPlayerId: z.string(),
});
export type GameContext = z.infer<typeof GameContextSchema>;

export const GamePhase = {
    SETUP: "SETUP",
    PLAYING: "PLAYING",
    FINISHED: "FINISHED",
} as const;
export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

export const GameStateSchema = z.object({
    ctx: GameContextSchema,
    towers: z.array(z.string()),
    players: z.array(GamePlayerSchema),
});
export type GameState = z.infer<typeof GameStateSchema>;
