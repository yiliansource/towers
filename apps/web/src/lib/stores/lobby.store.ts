"use client";

import { create } from "zustand";

import { LobbyView } from "@towers/shared/contracts/lobby";

import { fetchApi } from "@/lib/util/fetch-api";

type LobbyState = {
    loading: boolean;
    lobby: LobbyView | null;

    setLobby: (lobby: LobbyView | null) => void;
    resetLobby: () => void;
    hydrateLobby: () => Promise<void>;
};

export const useLobbyStore = create<LobbyState>()((set) => ({
    loading: true,
    lobby: null,

    setLobby: (lobby) => set({ lobby }),
    resetLobby: () => set({ lobby: null, loading: true }),
    hydrateLobby: async () => {
        try {
            set({ loading: true });

            const res = await fetchApi("/lobby");
            if (!res.ok) throw new Error();

            const lobby = (await res.json()) as LobbyView;
            set({ lobby });
        } catch {
            set({ lobby: null });
        } finally {
            set({ loading: false });
        }
    },
}));
