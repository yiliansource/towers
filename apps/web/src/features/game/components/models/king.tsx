import { Box, Cylinder } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/Addons.js";

export function King() {
    const height = 1.2;
    return (
        <group>
            <Cylinder position={[0, height / 2, 0]} args={[0.3, 0.4, height]} receiveShadow castShadow>
                <meshStandardMaterial color="white" />
            </Cylinder>
            <Box position={[0, 1.5, 0]} args={[0.5, 0.15, 0.15]}>
                <meshStandardMaterial color="white" />
            </Box>
            <Box position={[0, 1.45, 0]} args={[0.15, 0.5, 0.15]}>
                <meshStandardMaterial color="white" />
            </Box>
        </group>
    );
}
