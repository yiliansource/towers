import { Box, Html, Line } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/Addons.js";

import { Axial, axial, axialRange, parseAxial, stringifyAxial } from "@towers/shared/hexgrid";
import { hexToPixel } from "@towers/shared/hexgrid";

import { useGameStore } from "@/lib/stores/game.store";

export function HexBoard({ towerPositions }: { towerPositions: Axial[] }) {
    const { game, ui } = useGameStore();

    return (
        <>
            <Floor />

            {ui.hoveredHex && <Highlighter hex={ui.hoveredHex} />}

            {towerPositions.map((axial) => (
                <Tower key={stringifyAxial(axial)} hex={axial} />
            ))}
        </>
    );
}

function Floor() {
    return axialRange(axial(0, 0), 4).map((a) => <TileFloor key={stringifyAxial(a)} hex={a} />);
}

function TileFloor({ hex }: { hex: Axial }) {
    const [x, y] = hexToPixel(hex);

    return (
        <group position={[x, 0, y]}>
            {/* <Html center className="select-none pointer-events-none" position={[0, 0.1, 0]}>
                <p className="text-xs text-white opacity-10">
                    {hex.q},{hex.r}
                </p>
            </Html> */}
            <HexBase />
        </group>
    );
}

export function Highlighter({ hex }: { hex: Axial }) {
    const [x, y] = hexToPixel(hex);

    return (
        <group position={[x, 0, y]}>
            <HexHighlighter />
        </group>
    );
}

function HexHighlighter() {
    const geometry = useMemo(() => {
        const shape = new THREE.Shape();

        const radius = 1;

        const points = [...Array(6).keys()].map((i) => {
            const theta = ((i + 0.5) / 6) * Math.PI * 2;
            return new THREE.Vector2(Math.cos(theta) * radius, Math.sin(theta) * radius);
        });

        shape.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach((p) => shape.lineTo(p.x, p.y));
        shape.closePath();

        const geo = new THREE.ShapeGeometry(shape);

        geo.rotateX(-Math.PI / 2);

        return geo;
    }, []);

    return (
        <mesh geometry={geometry}>
            <meshBasicMaterial color="yellow" transparent opacity={0.3} depthWrite={false} />
        </mesh>
    );
}

function HexBase() {
    const points = [...Array(7).keys()].map((i) => {
        const theta = ((i + 0.5) / 6) * (Math.PI * 2);
        return [Math.cos(theta), 0, Math.sin(theta)] as [number, number, number];
    });

    return <Line points={points} color="#333" lineWidth={1} />;
}

function Tower({ hex }: { hex: Axial }) {
    const obj = useLoader(OBJLoader, "/tower.obj");
    const coloredObj = useMemo(() => {
        const clone = obj.clone();

        clone.scale.copy(new THREE.Vector3(1, 1, 1).multiplyScalar(0.72));
        clone.rotateY(30 * (Math.PI / 180));
        clone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;

                mesh.material = new THREE.MeshStandardMaterial({
                    color: "#d1a26d",
                });

                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });

        return clone;
    }, [obj]);

    const [x, y] = hexToPixel(hex);

    return (
        <group position={[x, 0, y]}>
            <primitive object={coloredObj} />
        </group>
    );
}
