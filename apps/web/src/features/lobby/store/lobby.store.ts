"use client";

import type { LobbyView } from "@towers/shared/contracts";

import { create } from "zustand";

export type LobbyStore = {
    loading: boolean;
    lobby: LobbyView | null;

    setLobby: (lobby: LobbyView | null) => void;
    clearLobby: (load?: boolean) => void;
    setLoading: (loading: boolean) => void;
};

export const useLobbyStore = create<LobbyStore>()((set) => ({
    loading: true,
    lobby: null,

    setLobby: (lobby) => set({ lobby }),
    clearLobby: () => set({ lobby: null }),
    setLoading: async (loading) => set({ loading }),
}));
