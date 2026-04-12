import type { UserView } from "@towers/shared/contracts";

import { create } from "zustand";

export type AuthStore = {
    loading: boolean;
    user: UserView | null;

    setUser: (user: UserView | null) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
    loading: false,
    user: null,

    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
    setLoading: (loading) => set({ loading }),
}));
