import type { StackedAxial } from "@towers/shared/hexgrid";
import { useMemo } from "react";
import * as THREE from "three";

import { stackedToWorld } from "@/common/util/hex2three";
import { useAuthStore } from "@/features/auth";

import { useGameCommands } from "../realtime/use-game-commands";
import { useGameStore } from "../store/game.store";

export function PlacementPickSurface({ coord }: { coord: StackedAxial }) {
    // const { setHoveredHex, selectHex } = useGameStore();
    const _user = useAuthStore((s) => s.user!);
    const game = useGameStore((s) => s.game!);
    const { placeKnight } = useGameCommands();

    const geometry = useMemo(() => {
        const shape = new THREE.Shape();
        const radius = 1;

        const points = [...Array(6).keys()].map((i) => {
            const theta = ((i + 0.5) / 6) * Math.PI * 2;
            return new THREE.Vector2(Math.cos(theta) * radius, Math.sin(theta) * radius);
        });

        shape.moveTo(points[0]?.x, points[0]?.y);
        for (const p of points.slice(1)) shape.lineTo(p.x, p.y);
        shape.closePath();

        const geo = new THREE.ShapeGeometry(shape);
        geo.rotateX(-Math.PI / 2);
        return geo;
    }, []);

    const [x, y, z] = stackedToWorld(coord);

    const handleClick = () => {
        if (game.ctx.phase === "SETUP") {
            placeKnight(coord);
        }
    };

    return (
        <mesh
            geometry={geometry}
            onClick={(e) => {
                e.stopPropagation();
                handleClick();
            }}
            onPointerMove={(e) => {
                e.stopPropagation();
                // setHoveredHex(coord);
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                // setHoveredHex(null);
            }}
            position={[x, y + 0.02, z]}
            userData={{ coord }}
        >
            <meshBasicMaterial depthWrite={false} opacity={0} side={THREE.DoubleSide} transparent />
        </mesh>
    );
}
