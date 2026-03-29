import { Socket, io } from "socket.io-client";

import { GameClientToServerEvents, GameServerToClientEvents } from "@towers/shared/contracts/game";

import { clientEnv } from "../env.client";

export type GameSocket = Socket<GameServerToClientEvents, GameClientToServerEvents>;

export function createGameSocket(): GameSocket {
    return io(`${clientEnv.NEXT_PUBLIC_API_URL}/game`, {
        withCredentials: true,
        transports: ["websocket"],
    });
}
