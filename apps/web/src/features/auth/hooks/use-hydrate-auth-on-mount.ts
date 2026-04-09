"use client";

import { useEffect } from "react";

import { getUser } from "../api/auth-actions";
import { useAuthStore } from "../store/auth.store";

export function useHydrateAuthOnMount() {
    const setUser = useAuthStore((s) => s.setUser);
    const clearUser = useAuthStore((s) => s.clearUser);
    const setLoading = useAuthStore((s) => s.setLoading);

    useEffect(() => {
        (async function () {
            try {
                setLoading(true);

                const user = await getUser();
                setUser(user);
            } catch {
                clearUser();
            } finally {
                setLoading(false);
            }
        })();
    }, []);
}
