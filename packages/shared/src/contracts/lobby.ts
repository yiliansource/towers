import z from "zod";

import { UserView } from "./auth.js";
import { SlotColor } from "./common.js";

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
    COLOR_OCCUPIED: "COLOR_OCCUPIED",
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

export interface LobbyErrorReponseBase {
    error: "LobbyError";
    code: string;
    message: string;
    timestamp: string;
}
export interface LobbyErrorHttpResponse extends LobbyErrorReponseBase {
    statusCode: number;
    path: string;
}
export interface LobbyErrorWsResponse extends LobbyErrorReponseBase {}

export const LobbyState = {
    WAITING: "WAITING",
    INGAME: "INGAME",
    FINISHED: "FINISHED",
} as const;
export type LobbyState = (typeof LobbyState)[keyof typeof LobbyState];

export interface LobbyServerToClientEvents {
    exception: (error: LobbyErrorWsResponse) => void;

    "lobby.updated": (payload: LobbyView) => void;
    "lobby.game_started": () => void;
    "lobby.removed": () => void;
}

export interface LobbyClientToServerEvents {
    "lobby.leave": () => void;
    "lobby.message": (payload: { message: string }) => void;
    "lobby.choose_color": (payload: { color: SlotColor }) => void;

    "lobby.switch_slot": (payload: { slot: number }) => void;
    "lobby.kick_slot": (payload: { slot: number }) => void;
    "lobby.promote_slot": (payload: { slot: number }) => void;

    "lobby.start_game": () => void;
}

export interface LobbyView {
    id: string;
    publicId: string;
    state: LobbyState;
    host: UserView;
    seats: LobbySeatView[];
}

export interface LobbySeatView {
    slot: number;
    color: SlotColor;
    user: UserView | null;
}
