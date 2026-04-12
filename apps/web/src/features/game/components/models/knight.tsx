import { getSlotColorValue } from "@towers/shared/util";

import { usePlayerColor } from "@/features/lobby";

import { Cylinder } from "@react-three/drei";
import Color from "color";

export interface KnightModelProps {
    playerId: string;
    highlight?: boolean;
    ghost?: boolean;
}

export function KnightModel({ playerId, highlight = false, ghost = false }: KnightModelProps) {
    const slotColor = usePlayerColor(playerId)!;
    const baseColor = Color(getSlotColorValue(slotColor));
    const accentColor = baseColor.lighten(0.4);
    const height = 0.8;

    return (
        <Cylinder
            args={[0.25, 0.35, height]}
            castShadow
            position={[0, height / 2, 0]}
            receiveShadow
        >
            <meshStandardMaterial
                color={highlight ? accentColor.hex() : baseColor.hex()}
                transparent={ghost}
                opacity={ghost ? 0.5 : 1}
            />
        </Cylinder>
    );
}
