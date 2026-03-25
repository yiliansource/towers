export const LobbyState = {
    WAITING: "WAITING",
    INGAME: "INGAME",
    FINISHED: "FINISHED",
} as const;
export type LobbyState = (typeof LobbyState)[keyof typeof LobbyState];

export interface UserView {
    id: string;
    username: string;
    connected: boolean;
}

export interface LobbyView {
    id: string;
    publicId: string;
    users: UserView[];
    hostUserId: string;
    state: LobbyState;
}

export interface LoginPayload {
    username: string;
    password: string;
}

export interface CreateLobbyPayload {}
export interface JoinLobbyPayload {
    roomId: string;
}

export interface ServerToClientEvents {
    "lobby:state": (body: LobbyView) => void;
    "lobby:removed": () => void;
}

export interface ClientToServerEvents {
    "lobby:subscribe": (body: { lobbyId: string }) => void;
    "lobby:unsubscribe": (body: { lobbyId: string }) => void;
}
