import type { StackedAxial } from "@towers/shared/hexgrid";
import { useMemo } from "react";

import { createHexGeometry } from "@/common/three/hex-geometry";
import { stackedToWorld } from "@/common/util/hex2three";

export function HexTileHighlight({ coord, color }: { coord: StackedAxial; color: string }) {
    const geometry = useMemo(() => createHexGeometry(), []);

    return (
        <group position={stackedToWorld(coord)}>
            <mesh geometry={geometry}>
                <meshBasicMaterial color={color} depthWrite={false} opacity={0.3} transparent />
            </mesh>
        </group>
    );
}
