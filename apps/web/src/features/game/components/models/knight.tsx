import { equalStackedAxial, StackedAxial } from "@towers/shared/hexgrid";

import { getSlotColorValue } from "@/common/util/color";
import { usePlayerColor } from "@/features/lobby";

import { Cylinder } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import Color from "color";
import { useRef } from "react";

import { useGameStore } from "../../store/game.store";

export function Knight({ playerId, coord }: { playerId: string; coord: StackedAxial }) {
    const draggingHex = useGameStore((s) => s.ui.draggingHex);
    const setDraggingHex = useGameStore((s) => s.setDraggingHex);

    const color = usePlayerColor(playerId)!;
    const colorValue = getSlotColorValue(color);
    const height = 0.8;

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
        <Cylinder
            args={[0.25, 0.35, height]}
            castShadow
            position={[0, height / 2, 0]}
            receiveShadow
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMissed={() => {
                // optional: useful for clicks that miss, but not required for dragging
            }}
        >
            <meshStandardMaterial
                color={
                    draggingHex && equalStackedAxial(draggingHex, coord)
                        ? Color(colorValue).lighten(0.4).hex()
                        : colorValue
                }
            />
        </Cylinder>
    );
}
