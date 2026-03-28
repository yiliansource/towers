"use client";

import { useEffect } from "react";

import { SocketProvider } from "@/components/socket-provider";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useGameStore } from "@/lib/stores/game.store";
import { useLobbyStore } from "@/lib/stores/lobby.store";

export function Providers({ children }: { children: React.ReactNode }) {
    const hydrateAuth = useAuthStore((s) => s.hydrateAuth);
    const hydrateLobby = useLobbyStore((s) => s.hydrateLobby);
    const hydrateGame = useGameStore((s) => s.hydrateGame);

    useEffect(() => {
        void hydrateAuth();
        void hydrateLobby();
        void hydrateGame();
    }, []);

    return (
        <>
            <SocketProvider>{children}</SocketProvider>
        </>
    );
}
