"use client";

import { createContext, useContext, useEffect } from "react";

import { socket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth.store";

const SocketContext = createContext(socket);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) return;

        socket.on("connect", () => console.log("socket connected!"));
        socket.on("disconnect", () => console.log("socket disconnected!"));

        return () => {
            if (socket.connected) socket.disconnect();

            socket.off("connect");
            socket.off("disconnect");
        };
    }, [user?.id]);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
    return useContext(SocketContext);
}
