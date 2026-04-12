import type { StackedAxial } from "@towers/shared/hexgrid";

import { createHexGeometry } from "@/common/three/hex-geometry";
import { stackedToWorld } from "@/common/util/hex2three";

import { useMemo } from "react";

export function HexTileHighlight({ coord, color }: { coord: StackedAxial; color: string }) {
    const geometry = useMemo(() => createHexGeometry(), []);

    return (
        <group position={stackedToWorld(coord)}>
            <mesh geometry={geometry} position={[0, 0.02, 0]} scale={0.95} renderOrder={20}>
                <meshBasicMaterial color={color} depthWrite={false} />
            </mesh>
        </group>
    );
}
