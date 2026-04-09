"use client";

import { create } from "zustand";

import { LobbyView } from "@towers/shared/contracts";

type LobbyState = {
    loading: boolean;
    lobby: LobbyView | null;

    setLobby: (lobby: LobbyView | null) => void;
    clearLobby: (load?: boolean) => void;
    setLoading: (loading: boolean) => void;
};

export const useLobbyStore = create<LobbyState>()((set) => ({
    loading: true,
    lobby: null,

    setLobby: (lobby) => set({ lobby }),
    clearLobby: (load = false) => set({ lobby: null, loading: load ? true : undefined }),
    setLoading: async (loading) => set({ loading }),
}));
