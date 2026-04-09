"use client";

import { useHydrateAuthOnMount } from "@/features/auth/hooks/use-hydrate-auth-on-mount";

export function Providers({ children }: { children: React.ReactNode }) {
    useHydrateAuthOnMount();

    return <>{children}</>;
}
