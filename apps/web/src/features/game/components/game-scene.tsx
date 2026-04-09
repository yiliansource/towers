import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { DevOnly } from "@/common/ui/dev-only";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLobbyStore } from "@/features/lobby/store/lobby.store";

import { useGameEvents } from "../realtime/use-game-events";
import { useGameStore } from "../store/game.store";
import { GameBoard } from "./game-board";
import { GameHud } from "./game-hud";
import { SceneCamera } from "./scene-camera";

export function GameScene() {
    useGameEvents();

    const user = useAuthStore((s) => s.user!);
    const lobby = useLobbyStore((s) => s.lobby!);
    const game = useGameStore((s) => s.game!);

    if (!lobby) throw new Error("Lobby was not loaded.");
    if (!user) throw new Error("User was not loaded.");
    if (!game) throw new Error("Game was not loaded.");

    return (
        <div className="grow grid h-[calc(100dvh-60px)] md:grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 grid-flow-row overflow-hidden">
            <GameHud />

            <div className="border border-(--gray-3) relative min-h-0 h-full overflow-hidden">
                <Canvas className="absolute inset-0" shadows>
                    <DevOnly>
                        <Stats className="left-auto! right-0!" />
                    </DevOnly>

                    <SceneLights />
                    <SceneCamera />

                    <GameBoard />
                </Canvas>
            </div>
        </div>
    );
}

function SceneLights() {
    const dir = new THREE.Vector3(0, 0, 1).setLength(10);
    dir.applyEuler(new THREE.Euler(-40 * (Math.PI / 180), -40 * (Math.PI / 180), 0));

    return (
        <>
            <ambientLight intensity={0.8} />
            <directionalLight
                intensity={2}
                position={dir}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-near={0.3}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />
        </>
    );
}
