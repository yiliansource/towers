import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { useGameStore } from "@/stores/game.store";

import { HexBoard } from "./hex-board";

export function GameScene() {
    const tileKeys = useGameStore((s) => (s.state ? Object.keys(s.state.towers) : []));

    return (
        <Canvas>
            <SceneLights />
            <SceneCamera />
            <HexBoard tileKeys={tileKeys} />
        </Canvas>
    );
}

function SceneLights() {
    return (
        <>
            <ambientLight intensity={Math.PI / 2} />
        </>
    );
}

function SceneCamera() {
    return (
        <>
            <PerspectiveCamera makeDefault position={new THREE.Vector3(0, 5, -5).setLength(18)} />
            <OrbitControls
                makeDefault
                minPolarAngle={(30 * Math.PI) / 180}
                maxPolarAngle={(70 * Math.PI) / 180}
                enablePan={false}
                minDistance={10}
                maxDistance={20}
                dampingFactor={0.2}
            />
        </>
    );
}
