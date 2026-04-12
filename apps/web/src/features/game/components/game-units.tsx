import { equalStackedAxial, StackedAxial } from "@towers/shared/hexgrid";

import { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";

import { useGameStore } from "../store/game.store";
import { KnightModel } from "./models/knight";

export function KnightUnit({ playerId, coord }: { playerId: string; coord: StackedAxial }) {
    const draggingHex = useGameStore((s) => s.ui.draggingHex);
    const setDraggingHex = useGameStore((s) => s.setDraggingHex);

    const pointerIdRef = useRef<number | null>(null);

    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setDraggingHex(coord);

        pointerIdRef.current = e.pointerId;
        (e.target as Element)?.setPointerCapture(e.pointerId);
    };

    const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (pointerIdRef.current !== e.pointerId) return;

        setDraggingHex(null);

        pointerIdRef.current = null;
        (e.target as Element)?.releasePointerCapture(e.pointerId);
    };

    return (
        <group onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
            <KnightModel
                playerId={playerId}
                highlight={!!draggingHex && equalStackedAxial(draggingHex, coord)}
            />
        </group>
    );
}
