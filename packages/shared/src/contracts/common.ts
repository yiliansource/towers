import { LobbyView } from "./lobby.js";

export interface ServerToClientEvents {
    "lobby:state": (body: LobbyView) => void;
    "lobby:removed": () => void;
}

export interface ClientToServerEvents {
    "lobby:subscribe": (body: { lobbyId: string }) => void;
    "lobby:unsubscribe": (body: { lobbyId: string }) => void;
}
