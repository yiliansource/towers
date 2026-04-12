import type {
    LobbyClientToServerEvents,
    LobbyServerToClientEvents,
} from "@towers/shared/contracts";

import { clientEnv } from "@/common/env/env.client";

import { io, type Socket } from "socket.io-client";

export type LobbySocket = Socket<LobbyServerToClientEvents, LobbyClientToServerEvents>;

export function createLobbySocket(): LobbySocket {
    return io(`${clientEnv.NEXT_PUBLIC_API_URL}/lobby`, {
        withCredentials: true,
        autoConnect: false,
        transports: ["websocket"],
    });
}
