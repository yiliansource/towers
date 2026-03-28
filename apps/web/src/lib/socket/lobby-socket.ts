import { Socket, io } from "socket.io-client";

import { LobbyClientToServerEvents, LobbyServerToClientEvents } from "@towers/shared/contracts/lobby";

export type LobbySocket = Socket<LobbyServerToClientEvents, LobbyClientToServerEvents>;

export function createLobbySocket(): LobbySocket {
    return io(`${process.env.NEXT_PUBLIC_API_URL}/lobby`, {
        withCredentials: true,
        transports: ["websocket"],
    });
}
