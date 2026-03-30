import { Box, Html, Line } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/Addons.js";

import { Axial, axial, axialRange, parseAxial, stringifyAxial } from "@towers/shared/hexgrid";
import { hexToPixel } from "@towers/shared/hexgrid";

export function HexBoard({ towerKeys }: { towerKeys: string[] }) {
    return (
        <>
            <Floor />

            {towerKeys.map((key) => (
                <Tower key={key} hex={parseAxial(key)} />
            ))}
        </>
    );
}

function Floor() {
    return axialRange(axial(0, 0), 4).map((a) => <TileFloor key={stringifyAxial(a)} hex={a} />);
}

function TileFloor({ hex }: { hex: Axial }) {
    const obj = useLoader(OBJLoader, "/hextile.obj");
    const coloredObj = useMemo(() => {
        const clone = obj.clone();

        clone.scale.copy(new THREE.Vector3(1, 1, 1).multiplyScalar(0.97));
        clone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;

                mesh.material = new THREE.MeshStandardMaterial({
                    color: "#444",
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
            {/* <Html center className="select-none pointer-events-none" position={[0, 0.1, 0]}>
                <p className="text-xs text-white opacity-5">
                    {hex.q},{hex.r}
                </p>
            </Html> */}
            <HexBase />
        </group>
    );
}

function HexBase() {
    const points = [...Array(7).keys()].map((i) => {
        const theta = i * (360 / 6) * (Math.PI / 180);
        return [Math.cos(theta), 0, Math.sin(theta)] as [number, number, number];
    });

    return (
        <Line
            points={points}
            color="#333"
            lineWidth={1} // thickness in pixels
        />
    );
}

function Tower({ hex }: { hex: Axial }) {
    const obj = useLoader(OBJLoader, "/tower.obj");
    const coloredObj = useMemo(() => {
        const clone = obj.clone();

        clone.scale.copy(new THREE.Vector3(1, 1, 1).multiplyScalar(0.72));
        clone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;

                mesh.material = new THREE.MeshStandardMaterial({
                    color: "#ca802b",
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
