import { useMemo } from "react";
import * as THREE from "three";

import { StackedAxial } from "@towers/shared/hexgrid";

import { useGameSocket } from "@/lib/hooks/use-game-socket";
import { useGameStore } from "@/lib/stores/game.store";
import { stackedToWorld } from "@/lib/util/hex2three";

export function PlacementPickSurface({ coord }: { coord: StackedAxial }) {
    const { setHoveredHex, selectHex } = useGameStore();
    const { game } = useGameStore();
    const { placeUnit } = useGameSocket();

    const geometry = useMemo(() => {
        const shape = new THREE.Shape();
        const radius = 1;

        const points = [...Array(6).keys()].map((i) => {
            const theta = ((i + 0.5) / 6) * Math.PI * 2;
            return new THREE.Vector2(Math.cos(theta) * radius, Math.sin(theta) * radius);
        });

        shape.moveTo(points[0]!.x, points[0]!.y);
        for (const p of points.slice(1)) shape.lineTo(p.x, p.y);
        shape.closePath();

        const geo = new THREE.ShapeGeometry(shape);
        geo.rotateX(-Math.PI / 2);
        return geo;
    }, []);

    const [x, y, z] = stackedToWorld(coord);

    const handleClick = () => {
        if (game?.ctx.phase === "SETUP") {
            placeUnit(coord);
        }
    };

    return (
        <mesh
            position={[x, y + 0.02, z]}
            geometry={geometry}
            userData={{ coord }}
            onPointerMove={(e) => {
                e.stopPropagation();
                setHoveredHex(coord);
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredHex(null);
            }}
            onClick={(e) => {
                e.stopPropagation();
                handleClick();
            }}
        >
            <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
    );
}
