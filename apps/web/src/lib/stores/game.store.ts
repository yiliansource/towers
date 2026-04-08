import { create, createStore } from "zustand";
import { immer } from "zustand/middleware/immer";

import { GameState } from "@towers/shared/contracts/game";
import { Axial } from "@towers/shared/hexgrid";

import { fetchApi } from "@/lib/util/fetch-api";

import { sleep } from "../util/sleep";

export type GameUiState = {
    hoveredHex: Axial | null;
    selectedHex: Axial | null;
};

export type GameStore = {
    loading: boolean;
    game: GameState | null;
    ui: GameUiState;

    hydrateGame: () => Promise<void>;
    resetGame: () => void;
    connectGameSocket: (gameId: string) => void;

    setHoveredHex: (hex: Axial | null) => void;
    selectHex: (hex: Axial) => void;
    clearSelection: () => void;

    submitMove: () => Promise<void>;
    applySnapshot: (snapshot: GameState) => void;
};

export const useGameStore = create<GameStore>()(
    immer((set) => ({
        loading: true,
        game: null,
        ui: {
            selectedHex: null,
            hoveredHex: null,
        },

        hydrateGame: async () => {
            try {
                set({ loading: true });

                await sleep(200);
                const res = await fetchApi("/game");
                if (!res.ok) throw new Error();

                const game = (await res.json()) as GameState;
                set({ game: game });
            } catch {
                set({ game: null });
            } finally {
                set({ loading: false });
            }
        },
        resetGame: () => set({ game: null, loading: true }),

        connectGameSocket: (gameId) => {},

        setHoveredHex: (hex) => {
            set((state) => {
                state.ui.hoveredHex = hex;
            });
        },
        selectHex: (hex) => {
            set((state) => {
                state.ui.selectedHex = hex;
            });
        },
        clearSelection: () => {
            set((state) => {
                state.ui.selectedHex = null;
                state.ui.selectedHex = null;
            });
        },

        submitMove: async () => {},
        applySnapshot: (snapshot) => {
            set((state) => {
                state.game = snapshot;
            });
        },
    })),
);
