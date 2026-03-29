import { Html } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/Addons.js";

import { Axial, axial } from "@towers/shared/hexgrid";
import { hexToPixel } from "@towers/shared/hexgrid";

export function HexBoard({ tileKeys }: { tileKeys: string[] }) {
    return (
        <>
            {tileKeys.map((key) => (
                <TileFloor key={key} hex={axial(0, 0)} />
            ))}
        </>
    );
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
            <Html className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
                <p className="text-sm text-(--gray-6)">
                    {hex.q},{hex.r}
                </p>
            </Html>
            <primitive object={coloredObj} />
        </group>
    );
}
