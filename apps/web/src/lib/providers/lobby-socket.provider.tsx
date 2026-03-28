"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";

import { type LobbySocket, createLobbySocket } from "@/lib/socket/lobby-socket";

type LobbySocketContextValue = {
    socket: LobbySocket | null;
    connected: boolean;
};

const LobbySocketContext = createContext<LobbySocketContextValue | null>(null);

export function LobbySocketProvider({ children }: PropsWithChildren) {
    const [socket, setSocket] = useState<LobbySocket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const nextSocket = createLobbySocket();

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        nextSocket.on("connect", onConnect);
        nextSocket.on("disconnect", onDisconnect);

        setSocket(nextSocket);

        return () => {
            nextSocket.off("connect", onConnect);
            nextSocket.off("disconnect", onDisconnect);
            nextSocket.disconnect();

            setSocket(null);
            setConnected(false);
        };
    }, []);

    const value = useMemo(() => ({ socket, connected }), [socket, connected]);

    return <LobbySocketContext.Provider value={value}>{children}</LobbySocketContext.Provider>;
}

export function useLobbySocketContext(): LobbySocketContextValue {
    const value = useContext(LobbySocketContext);
    if (!value) {
        throw new Error("useLobbySocketContext must be used within LobbySocketProvider");
    }
    return value;
}
