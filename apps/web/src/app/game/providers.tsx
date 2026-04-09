"use client";

import { GameSocketProvider } from "@/features/game";

export default function GameProviders({ children }: { children: React.ReactNode }) {
    return <GameSocketProvider>{children}</GameSocketProvider>;
}
