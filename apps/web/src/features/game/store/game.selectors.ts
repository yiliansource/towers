import { GameStore } from "./game.store";

export function selectIsInTurn(userId: string | null) {
    return (store: GameStore) => {
        if (!store.context || !userId) return false;
        return store.context.currentPlayerId === userId;
    };
}

export const selectCurrentAction = (store: GameStore) => {
    return store.actionState?.action;
};

export const selectCurrentActionStep = (store: GameStore) => {
    if (!store.actionState) return null;
    return store.actionState.action.steps[store.actionState.stepIndex];
};

export function selectPlayerResources(userId: string | null) {
    return (store: GameStore) => {
        if (!store.boardState || !userId) return null;
        return store.boardState.resources[userId];
    };
}
