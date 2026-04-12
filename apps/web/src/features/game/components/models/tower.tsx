import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/Addons.js";

export interface TowerModelProps {
    ghost?: boolean;
}

export function TowerModel({ ghost = false }: TowerModelProps) {
    const obj = useLoader(OBJLoader, "/tower.obj");
    const coloredObj = useMemo(() => {
        const clone = obj.clone();

        clone.scale.copy(new THREE.Vector3(1, 1, 1).multiplyScalar(0.72));
        clone.rotateY(30 * (Math.PI / 180));
        clone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;

                const transparent = ghost;
                mesh.material = new THREE.MeshStandardMaterial({
                    color: "#d1a26d",
                    opacity: ghost ? 0.5 : 1,
                    transparent,
                });

                if (!transparent) {
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                } else {
                    mesh.raycast = () => null;
                }
            }
        });

        return clone;
    }, [obj, ghost]);

    return <primitive object={coloredObj} />;
}
