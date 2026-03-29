"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/lib/stores/auth.store";

export function Providers({ children }: { children: React.ReactNode }) {
    const hydrateAuth = useAuthStore((s) => s.hydrateAuth);

    useEffect(() => {
        void hydrateAuth();
    }, []);

    return <>{children}</>;
}
