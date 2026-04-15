import { equalStackedAxial, StackedAxial } from "@towers/shared/hexgrid";

import { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";

import { selectCurrentActionStep } from "../store/game.selectors";
import { useGameStore } from "../store/game.store";
import { useIsInTurn } from "../store/use-game-derived";
import { KnightModel } from "./models/knight";

export function KnightUnit({ playerId, coord }: { playerId: string; coord: StackedAxial }) {
    const draggingHex = useGameStore((s) => s.ui.draggingHex);
    const setDraggingHex = useGameStore((s) => s.setDraggingHex);

    const isPlayer = useGameStore((s) => s.context?.currentPlayerId === playerId);
    const actionStep = useGameStore(selectCurrentActionStep);

    const actionState = useGameStore((s) => s.actionState);
    const setActionData = useGameStore((s) => s.setActionData);
    const advanceActionStep = useGameStore((s) => s.advanceActionStep);
    const setActionStep = useGameStore((s) => s.setActionStep);
    const startAction = useGameStore((s) => s.startAction);

    const isInTurn = useIsInTurn();

    const highlight =
        (isPlayer && actionState?.action.name === "moveUnit" && actionStep === "selectUnit") ||
        (isPlayer &&
            actionState?.action.name === "moveUnit" &&
            actionStep === "selectHex" &&
            equalStackedAxial(coord, actionState.data.selectedUnit as StackedAxial)) ||
        (!!draggingHex && equalStackedAxial(draggingHex, coord));

    const pointerIdRef = useRef<number | null>(null);

    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();

        if (!isInTurn || !isPlayer) return;

        if (actionState) {
            if (actionState?.action.name !== "moveUnit" || actionStep !== "selectUnit") return;
            setActionData("selectedUnit", coord);
            advanceActionStep();
        } else {
            setDraggingHex(coord);
            startAction("moveUnit");
            setActionStep(1);
            setActionData("selectedUnit", coord);
            setActionData("wasStartedByDrag", true);

            pointerIdRef.current = e.pointerId;
            (e.target as Element)?.setPointerCapture(e.pointerId);
        }
    };

    const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (pointerIdRef.current !== e.pointerId) return;

        setDraggingHex(null);

        pointerIdRef.current = null;
        (e.target as Element)?.releasePointerCapture(e.pointerId);
    };

    return (
        <group onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
            <KnightModel playerId={playerId} highlight={highlight} />
        </group>
    );
}
