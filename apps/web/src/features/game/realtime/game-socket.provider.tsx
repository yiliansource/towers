"use client";

import { createLogger } from "@/common/util/logger";

import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { createGameSocket, type GameSocket } from "./game-socket";

type GameSocketContextValue = {
    socket: GameSocket | null;
    connected: boolean;
};

const GameSocketContext = createContext<GameSocketContextValue | null>(null);

const logger = createLogger("game-socket-provider");

export function GameSocketProvider({ children }: PropsWithChildren) {
    const [socket, setSocket] = useState<GameSocket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const nextSocket = createGameSocket();

        const onConnect = () => {
            logger.log("connected");
            setConnected(true);
        };
        const onDisconnect = () => {
            logger.log("disconnected");
            setConnected(false);
        };

        nextSocket.on("connect", onConnect);
        nextSocket.on("disconnect", onDisconnect);

        setSocket(nextSocket);

        return () => {
            if (nextSocket.connected) nextSocket.disconnect();

            nextSocket.off("connect", onConnect);
            nextSocket.off("disconnect", onDisconnect);

            setSocket(null);
            setConnected(false);
        };
    }, []);

    const value = useMemo(() => ({ socket, connected }), [socket, connected]);

    return <GameSocketContext.Provider value={value}>{children}</GameSocketContext.Provider>;
}

export function useGameSocketContext(): GameSocketContextValue {
    const value = useContext(GameSocketContext);
    if (!value) {
        throw new Error("useGameSocketContext must be used within GameSocketProvider");
    }
    return value;
}
