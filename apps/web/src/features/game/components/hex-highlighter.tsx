import { useMemo } from "react";

import { StackedAxial } from "@towers/shared/hexgrid";

import { createHexGeometry } from "@/common/three/hex-geometry";
import { stackedToWorld } from "@/common/util/hex2three";

export function HexTileHighlight({ coord, color }: { coord: StackedAxial; color: string }) {
    const geometry = useMemo(() => createHexGeometry(), []);

    return (
        <group position={stackedToWorld(coord)}>
            <mesh geometry={geometry}>
                <meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false} />
            </mesh>
        </group>
    );
}
