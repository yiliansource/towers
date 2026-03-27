import { create, createStore } from "zustand";
import { immer } from "zustand/middleware/immer";

import { GameState } from "@towers/shared/contracts/game";
import { Axial } from "@towers/shared/hexgrid";

export type GameUiState = {
    hoveredHex: Axial | null;
    selectedHex: Axial | null;
    selectedUnitId: string | null;
    isSubmittingMove: boolean;
};

export type GameStore = {
    state: GameState | null;
    ui: GameUiState;

    hydrateGame: (gameId: string) => Promise<void>;
    connectGameSocket: (gameId: string) => void;

    setHoveredHex: (hex: Axial | null) => void;
    selectHex: (hex: Axial) => void;
    clearSelection: () => void;

    submitMove: () => Promise<void>;
    applySnapshot: (snapshot: GameState) => void;
};

export const useGameStore = create<GameStore>()(
    immer((set) => ({
        state: null,
        ui: {
            selectedHex: null,
            hoveredHex: null,
            selectedUnitId: null,
            isSubmittingMove: false,
        },

        hydrateGame: async (gameId) => {},
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
