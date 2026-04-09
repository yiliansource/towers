"use client";

import { LobbySocketProvider } from "@/features/lobby";

export default function LobbyProviders({ children }: { children: React.ReactNode }) {
    return <LobbySocketProvider>{children}</LobbySocketProvider>;
}
