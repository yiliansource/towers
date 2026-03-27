import { create } from "zustand";

import { UserView } from "@towers/shared/contracts/auth";

export type AuthStore = {
    user: UserView | null;
    loading: boolean;

    setUser: (user: UserView | null) => void;
    setLoading: (loading: boolean) => void;

    logoutLocal: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    loading: false,

    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),

    logoutLocal: () => set({ user: null }),
}));
