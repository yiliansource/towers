import { create } from "zustand";

import { UserView } from "@towers/shared";

type AuthState = {
    user: UserView | null;
    loading: boolean;

    setUser: (user: UserView | null) => void;
    setLoading: (loading: boolean) => void;

    logoutLocal: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: false,

    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),

    logoutLocal: () => set({ user: null }),
}));
