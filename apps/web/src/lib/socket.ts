"use client";

import { type Socket, io } from "socket.io-client";

import type { ClientToServerEvents, ServerToClientEvents } from "@towers/shared";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: false,
    withCredentials: true,
});
