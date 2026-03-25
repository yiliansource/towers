"use client";

import { create } from "zustand";

import { LobbyView } from "@towers/shared/contracts/lobby";

type LobbyState = {
    lobby: LobbyView | null;
    loading: boolean;

    setLobby: (lobby: LobbyView | null) => void;
    setLoading: (loading: boolean) => void;
};

export const useLobbyStore = create<LobbyState>()((set) => ({
    lobby: null,
    loading: true,

    setLobby: (lobby) => set({ lobby }),
    setLoading: (loading) => set({ loading }),
}));
