import { z } from "zod";

import { StackedAxialSchema } from "./hex.js";

export const GameErrorCode = {
    INVALID_GAME_STATE: "INVALID_GAME_STATE",
} as const;
export type GameErrorCode = (typeof GameErrorCode)[keyof typeof GameErrorCode];

export class GameError extends Error {
    constructor(
        public readonly code: GameErrorCode,
        message?: string,
    ) {
        super(message ?? code);
        this.name = "GameError";
    }
}

export const GamePhase = {
    SETUP: "SETUP",
    PLAYING: "PLAYING",
    FINISHED: "FINISHED",
} as const;
export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

export interface GameServerToClientEvents {
    "game.finished": () => void;
    "game.updated": (snapshot: GameState) => void;
}

export interface GameClientToServerEvents {
    "game.perform_action": (payload: GamePerformActionPayload) => boolean;
    "game.message": (payload: string) => void;
}

export const GamePlayerSchema = z.object({
    id: z.string(),
    username: z.string(),
    points: z.number(),
});
export type GamePlayer = z.infer<typeof GamePlayerSchema>;

export const GameContextSchema = z.object({
    turn: z.number(),
    phase: z.enum(GamePhase),
    currentPlayerId: z.string(),
    totalPlayers: z.number(),
    playOrder: z.array(z.string()),
    playOrderPos: z.int(),
});
export type GameContext = z.infer<typeof GameContextSchema>;

export const GameStateSchema = z.object({
    ctx: GameContextSchema,
    towers: z.array(StackedAxialSchema),
    units: z.record(z.string(), z.array(StackedAxialSchema)),
    players: z.array(GamePlayerSchema),
});
export type GameState = z.infer<typeof GameStateSchema>;

export const GamePerformActionPayloadSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("none"),
    }),
    z.object({
        type: z.literal("endTurn"),
    }),
    z.object({
        type: z.literal("placeUnit"),
        coord: StackedAxialSchema,
    }),
]);
export type GamePerformActionPayload = z.infer<typeof GamePerformActionPayloadSchema>;
