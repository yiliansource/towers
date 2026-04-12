import { useMemo } from "react";
import * as THREE from "three";

export interface ClickableHexProps {
    onClick?: () => void;
    onHoverChanged?: (hover: boolean) => void;
}

export function ClickableHex({ onClick, onHoverChanged }: ClickableHexProps) {
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

    return (
        <mesh
            geometry={geometry}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
            onPointerMove={(e) => {
                e.stopPropagation();
                onHoverChanged?.(true);
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                onHoverChanged?.(false);
            }}
        >
            <meshBasicMaterial depthWrite={false} opacity={0} side={THREE.DoubleSide} transparent />
        </mesh>
    );
}
