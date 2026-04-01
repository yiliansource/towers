import { create } from "zustand";

import { UserView } from "@towers/shared/contracts/auth";

import { fetchApi } from "@/lib/util/fetch-api";

export type AuthStore = {
    loading: boolean;
    user: UserView | null;

    setUser: (user: UserView | null) => void;
    hydrateAuth: () => Promise<void>;

    logoutLocal: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    loading: false,

    setUser: (user) => set({ user }),
    hydrateAuth: async () => {
        try {
            set({ loading: true });

            const res = await fetchApi("/auth/me");
            if (!res.ok) {
                if (res.status === 401) {
                    await fetchApi("/auth/logout", { method: "POST" });
                    return;
                }

                throw new Error();
            }

            const user = (await res.json()) as UserView;
            set({ user });
        } catch {
            set({ user: null });
        } finally {
            set({ loading: false });
        }
    },

    logoutLocal: () => set({ user: null }),
}));
