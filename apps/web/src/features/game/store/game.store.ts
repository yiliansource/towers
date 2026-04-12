import type {
    GameAction,
    GameBoardState,
    GameContext,
    GameSnapshot,
} from "@towers/shared/contracts";
import type { StackedAxial } from "@towers/shared/hexgrid";

import { useAuthStore } from "@/features/auth";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type GameUiState = {
    draggingHex: StackedAxial | null;
    hoveredHex: StackedAxial | null;
    selectedHex: StackedAxial | null;
};

export type GameActionState = {
    action: GameAction;
    stepIndex: number;
    data: Record<string, unknown>;
};

export type GameStore = {
    loading: boolean;
    context: GameContext | null;
    boardState: GameBoardState | null;
    actionState: GameActionState | null;
    availableActions: GameAction[];
    ui: GameUiState;

    applySnapshot: (snapshot: GameSnapshot) => void;
    clearGame: () => void;
    setLoading: (loading: boolean) => void;

    startAction: (actionName: string) => void;
    setActionData: (key: string, value: unknown) => void;
    clearActionData: (key: string) => void;
    advanceActionStep: () => void;
    decreaseActionStep: () => void;
    clearAction: (cancel?: boolean) => boolean;

    setDraggingHex: (coord: StackedAxial | null) => void;
};

export const useGameStore = create<GameStore>()(
    immer((set, get) => ({
        loading: true,
        context: null,
        boardState: null,
        actionState: null,
        availableActions: [],
        ui: {
            draggingHex: null,
            selectedHex: null,
            hoveredHex: null,
        },

        applySnapshot: ({ context, boardState, availableActions }) => {
            set({
                context,
                boardState,
                availableActions,
            });

            const userId = useAuthStore.getState().user?.id;
            if (context.currentPlayerId !== userId) {
                get().clearAction();
                return;
            }

            const forcedAction = availableActions.find((a) => a.forced);
            if (forcedAction) {
                get().startAction(forcedAction.name);
            }
        },
        clearGame: () =>
            set({
                context: null,
                boardState: null,
                availableActions: [],
            }),
        setLoading: (loading) => set({ loading }),

        startAction: (actionName) => {
            const action = get().availableActions.find((a) => a.name === actionName);
            if (!action) return;

            set({
                actionState: {
                    action,
                    data: {},
                    stepIndex: 0,
                },
            });
        },
        setActionData: (key, value) => {
            set((draft) => {
                if (!draft.actionState) return;
                draft.actionState.data[key] = value;
            });
        },
        clearActionData: (key) => {
            set((draft) => {
                if (!draft.actionState) return;
                delete draft.actionState.data[key];
            });
        },
        advanceActionStep: () => {
            set((draft) => {
                if (!draft.actionState) return;
                draft.actionState.stepIndex++;
            });
        },
        decreaseActionStep: () => {
            set((draft) => {
                if (!draft.actionState) return;
                draft.actionState.stepIndex--;
            });
        },
        clearAction: (_cancel = false) => {
            const currentAction = get().actionState?.action;

            set({
                actionState: null,
            });

            return !!currentAction;
        },

        setDraggingHex: (coord) => {
            set((draft) => {
                draft.ui.draggingHex = coord;
            });
        },
    })),
);
