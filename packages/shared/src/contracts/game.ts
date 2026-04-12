import { z } from "zod";

import { StackedAxialSchema } from "./hex.js";
import type { LobbyView } from "./lobby.js";

export const GameErrorCode = {
    INVALID_GAME_STATE: "INVALID_GAME_STATE",
    INVALID_GAME_OPERATION: "INVALID_GAME_OPERATION",
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
    "game.updated": (payload: GameSnapshot) => void;
    "game.lobby_updated": (payload: LobbyView) => void;
}

export interface GameClientToServerEvents {
    "game.submit_action": (payload: GameActionSubmitPayload) => void;
    "game.end_turn": () => void;
    "game.abort_game": () => void;
    "game.message": (payload: string) => void;
}

export const GameContextSchema = z.object({
    totalPlayers: z.number(),
    phase: z.enum(GamePhase),
    innerPhaseIndex: z.int(),
    turn: z.int(),
    playOrder: z.array(z.string()),
    playOrderPos: z.int(),
    currentPlayerId: z.string(),
});
export type GameContext = z.infer<typeof GameContextSchema>;

export const GameBoardStateSchema = z.object({
    king: StackedAxialSchema,
    towers: z.array(StackedAxialSchema),
    units: z.record(z.string(), z.array(StackedAxialSchema)),
    resources: z.record(
        z.string(),
        z.object({
            score: z.int(),
            actionPoints: z.int(),
            towers: z.int(),
            knights: z.int(),
        }),
    ),
});
export type GameBoardState = z.infer<typeof GameBoardStateSchema>;

export const UnitType = {
    KNIGHT: "KNIGHT",
    KING: "KING",
} as const;
export type UnitType = (typeof UnitType)[keyof typeof UnitType];

export const GameActionStepSchema = z.enum(["selectUnit", "selectHex", "confirm"]);
export type GameActionStep = z.infer<typeof GameActionStepSchema>;

export const GameActionSchema = z
    .discriminatedUnion("name", [
        z.object({
            name: z.literal("placeTower"),
            availableCoords: z.array(StackedAxialSchema).optional(),
        }),
        z.object({
            name: z.literal("placeUnit"),
            availableCoords: z.array(StackedAxialSchema).optional(),
        }),
        z.object({
            name: z.literal("moveUnit"),
        }),
    ])
    .and(
        z.object({
            steps: z.array(GameActionStepSchema),
            cost: z.discriminatedUnion("type", [
                z.object({
                    type: z.literal("fixed"),
                    amount: z.number(),
                }),
                z.object({
                    type: z.literal("dynamic"),
                }),
            ]),
            forced: z.boolean().optional(),
        }),
    );
export type GameAction = z.infer<typeof GameActionSchema>;

export const GameActionSubmitPayloadSchema = z.discriminatedUnion("name", [
    z.object({
        name: z.literal("placeTower"),
        coord: StackedAxialSchema,
    }),
    z.object({
        name: z.literal("placeUnit"),
        unit: z.enum(UnitType),
        coord: StackedAxialSchema,
    }),
    z.object({
        name: z.literal("moveUnit"),
        unit: StackedAxialSchema,
        coord: StackedAxialSchema,
    }),
]);
export type GameActionSubmitPayload = z.infer<typeof GameActionSubmitPayloadSchema>;

export const GameStateSchema = z.object({
    context: GameContextSchema,
    boardState: GameBoardStateSchema,
});
export type GameState = z.infer<typeof GameStateSchema>;

export const GameSnapshotSchema = GameStateSchema.extend({
    availableActions: z.array(GameActionSchema),
});
export type GameSnapshot = z.infer<typeof GameSnapshotSchema>;
