import z from "zod";

import { UserView } from "./auth.js";

export const LobbyErrorCode = {
    LOBBY_NOT_FOUND: "LOBBY_NOT_FOUND",
    LOBBY_FULL: "LOBBY_FULL",
    LOBBY_ALREADY_STARTED: "LOBBY_ALREADY_STARTED",
    LOBBY_NOT_JOINABLE: "LOBBY_NOT_JOINABLE",

    USER_ALREADY_IN_LOBBY: "USER_ALREADY_IN_LOBBY",
    USER_ALREADY_IN_THIS_LOBBY: "USER_ALREADY_IN_THIS_LOBBY",
    USER_NOT_IN_LOBBY: "USER_NOT_IN_LOBBY",

    NOT_LOBBY_HOST: "NOT_LOBBY_HOST",
    SEAT_OCCUPIED: "SEAT_OCCUPIED",
} as const;
export type LobbyErrorCode = (typeof LobbyErrorCode)[keyof typeof LobbyErrorCode];

export class LobbyError extends Error {
    constructor(
        public readonly code: LobbyErrorCode,
        message?: string,
    ) {
        super(message ?? code);
        this.name = "LobbyError";
    }
}

export const LobbyState = {
    WAITING: "WAITING",
    INGAME: "INGAME",
    FINISHED: "FINISHED",
} as const;
export type LobbyState = (typeof LobbyState)[keyof typeof LobbyState];

export interface LobbyView {
    id: string;
    publicId: string;
    state: LobbyState;
    host: UserView;
    seats: LobbySeatView[];
}

export interface LobbySeatView {
    slot: number;
    user: UserView | null;
}

export const JoinLobbySchema = z.object({
    lobbyId: z
        .string()
        .length(4, "Lobby ID must be 4 characters long.")
        .regex(/[A-Z]/, "Lobby ID must only consist of A-Z."),
});

export type JoinLobbyInput = z.infer<typeof JoinLobbySchema>;
