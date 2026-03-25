"use client";

import { type Socket, io } from "socket.io-client";

import { ClientToServerEvents, ServerToClientEvents } from "@towers/shared/contracts/common";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: false,
    withCredentials: true,
});
