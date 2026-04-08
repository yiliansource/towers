import { useFrame, useThree } from "@react-three/fiber";
import { X } from "lucide-react";
import { useMemo } from "react";
import * as THREE from "three";

import { axial, pixelToHex } from "@towers/shared/hexgrid";

import { useGameStore } from "@/lib/stores/game.store";

export function CursorTracker() {
    const { camera, raycaster, pointer, size } = useThree();
    const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

    const { setHoveredHex } = useGameStore();
    const target = useMemo(() => new THREE.Vector3(), []);

    // useFrame(() => {
    //     raycaster.setFromCamera(pointer, camera);

    //     raycaster.ray.intersectPlane(plane, target);

    //     setHoveredHex(pixelToHex([target.x, target.z]));
    // });

    return null;
}
