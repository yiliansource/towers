import { Socket, io } from "socket.io-client";

import { LobbyClientToServerEvents, LobbyServerToClientEvents } from "@towers/shared/contracts/lobby";

import { clientEnv } from "../env.client";

export type LobbySocket = Socket<LobbyServerToClientEvents, LobbyClientToServerEvents>;

export function createLobbySocket(): LobbySocket {
    return io(`${clientEnv.NEXT_PUBLIC_API_URL}/lobby`, {
        withCredentials: true,
        transports: ["websocket"],
    });
}
