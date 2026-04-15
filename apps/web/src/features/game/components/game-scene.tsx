import { DevOnly } from "@/common/ui/dev-only";

import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { useGameEvents } from "../realtime/use-game-events";
import { GameBoard } from "./game-board";
import { GameHudOverlay } from "./game-hud-overlay";
import { GameSidebarInterface } from "./game-sidebar-interface";
import { SceneCamera } from "./scene-camera";

export function GameScene() {
    useGameEvents();

    return (
        <div className="grow grid h-[calc(100dvh-60px)] md:grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 grid-flow-row">
            <GameSidebarInterface />

            <div className="relative border border-(--gray-3) min-h-0 h-full overflow-hidden">
                <Canvas className="absolute inset-0" shadows>
                    <DevOnly>
                        <Stats className="left-auto! right-0!" />
                    </DevOnly>

                    <SceneLights />
                    <SceneCamera />

                    <GameBoard />
                </Canvas>

                <div className="absolute inset-0 pointer-events-none">
                    <GameHudOverlay />
                </div>
            </div>
        </div>
    );
}

function SceneLights() {
    const mainLightDir = new THREE.Vector3(0, 0, 1).setLength(10);
    mainLightDir.applyEuler(new THREE.Euler(-40 * (Math.PI / 180), -40 * (Math.PI / 180), 0));

    const offLightDir = mainLightDir.clone().applyEuler(new THREE.Euler(0, Math.PI, 0));

    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight
                castShadow
                intensity={2}
                position={mainLightDir}
                shadow-camera-bottom={-10}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-near={0.3}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0001}
                shadow-normalBias={0.02}
            />
            <directionalLight intensity={0.6} position={offLightDir} />
        </>
    );
}
