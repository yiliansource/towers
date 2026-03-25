"use client";

import { useEffect } from "react";

import { SocketProvider } from "@/components/socket-provider";
import { hydrateAuth } from "@/lib/hydrate-auth";

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        void hydrateAuth();
    }, []);

    return (
        <>
            <SocketProvider>{children}</SocketProvider>
        </>
    );
}
