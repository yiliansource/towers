import { create, createStore } from "zustand";
import { immer } from "zustand/middleware/immer";

import { GameState } from "@towers/shared/contracts/game";
import { Axial } from "@towers/shared/hexgrid";

import { fetchApi } from "@/lib/util/fetch-api";

export type GameUiState = {
    hoveredHex: Axial | null;
    selectedHex: Axial | null;
    selectedUnitId: string | null;
    isSubmittingMove: boolean;
};

export type GameStore = {
    loading: boolean;
    game: GameState | null;
    ui: GameUiState;

    hydrateGame: () => Promise<void>;
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
            selectedUnitId: null,
            isSubmittingMove: false,
        },

        hydrateGame: async () => {
            try {
                set({ loading: true });

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
        applySnapshot: (snapshot) => {},
    })),
);
