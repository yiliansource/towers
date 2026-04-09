import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { GameState } from "@towers/shared/contracts";
import { StackedAxial } from "@towers/shared/hexgrid";

export type GameUiState = {
    hoveredHex: StackedAxial | null;
    selectedHex: StackedAxial | null;
};

export type GameStore = {
    loading: boolean;
    game: GameState | null;
    ui: GameUiState;

    setGame: (game: GameState | null) => void;
    clearGame: () => void;
    setLoading: (loading: boolean) => void;
};

export const useGameStore = create<GameStore>()(
    immer((set) => ({
        loading: true,
        game: null,
        ui: {
            selectedHex: null,
            hoveredHex: null,
        },

        setGame: (game) => set({ game }),
        clearGame: () => set({ game: null }),
        setLoading: (loading) => set({ loading }),
    })),
);
