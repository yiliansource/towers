import type { GameClientToServerEvents, GameServerToClientEvents } from "@towers/shared/contracts";
import { io, type Socket } from "socket.io-client";

import { clientEnv } from "@/common/env/env.client";

export type GameSocket = Socket<GameServerToClientEvents, GameClientToServerEvents>;

export function createGameSocket(): GameSocket {
    return io(`${clientEnv.NEXT_PUBLIC_API_URL}/game`, {
        withCredentials: true,
        transports: ["websocket"],
    });
}
