import type {
    LobbyClientToServerEvents,
    LobbyServerToClientEvents,
} from "@towers/shared/contracts";
import { io, type Socket } from "socket.io-client";

import { clientEnv } from "@/common/env/env.client";

export type LobbySocket = Socket<LobbyServerToClientEvents, LobbyClientToServerEvents>;

export function createLobbySocket(): LobbySocket {
    return io(`${clientEnv.NEXT_PUBLIC_API_URL}/lobby`, {
        withCredentials: true,
        autoConnect: false,
        transports: ["websocket"],
    });
}
