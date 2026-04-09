"use client";

import { useHydrateAuthOnMount } from "@/features/auth";

export function Providers({ children }: { children: React.ReactNode }) {
    useHydrateAuthOnMount();

    return <>{children}</>;
}
