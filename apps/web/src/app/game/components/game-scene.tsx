import { Button } from "@radix-ui/themes";
import { PerformanceMonitor, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { produce } from "immer";
import { useEffect } from "react";
import * as THREE from "three";

import { stringifyAxial } from "@towers/shared/hexgrid";

import { DebugJson } from "@/components/debug-json";
import { DevOnly } from "@/components/dev-only";
import { useGameInfo } from "@/lib/hooks/use-game-info";
import { useGameSocket } from "@/lib/hooks/use-game-socket";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useGameStore } from "@/lib/stores/game.store";
import { useLobbyStore } from "@/lib/stores/lobby.store";
import { cn } from "@/lib/util/cn";

import { CursorTracker } from "./cursor-tracker";
import { HexBoard } from "./hex-board";
import { SceneCamera } from "./scene-camera";

export function GameScene() {
    const { lobby } = useLobbyStore();
    const { user } = useAuthStore();
    const { game, ui } = useGameStore();

    const { socket, connected, endTurn } = useGameSocket();

    const handleEndTurn = async () => {
        void endTurn();
    };

    if (!lobby) throw new Error("Lobby was not loaded.");
    if (!user) throw new Error("User was not loaded.");
    if (!game) throw new Error("Game was not loaded.");

    const { isHostUser, isInTurn } = useGameInfo();

    useEffect(() => {
        if (isInTurn) console.log("turn started");
        else console.log("turn ended");
    }, [isInTurn]);

    return (
        <div className="grow grid h-[calc(100dvh-60px)] md:grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 grid-flow-row overflow-hidden">
            <div className="flex flex-col min-h-0 overflow-y-auto">
                <h1 className="mt-6 mb-10 leading-none font-fruktur text-[70px] text-center">towers</h1>
                <div className="flex flex-col gap-2">
                    {lobby.seats
                        .filter((s) => !!s.user)
                        .map((s) => (
                            <div key={s.slot}>
                                <p className={cn(game.ctx.currentPlayerId === s.user!.id && "font-bold")}>
                                    {s.user!.username}
                                </p>
                            </div>
                        ))}
                </div>

                <div className="mt-auto mb-0">
                    <div className="w-full">
                        <Button className="mb-2! w-full!" disabled={!isInTurn} onClick={handleEndTurn}>
                            End turn
                        </Button>
                    </div>
                    <DevOnly>
                        <DebugJson object={game} />
                    </DevOnly>
                </div>
            </div>

            <div className="border border-(--gray-3) relative min-h-0 h-full overflow-hidden">
                <Canvas className="absolute inset-0" shadows>
                    <DevOnly>
                        <Stats />
                    </DevOnly>

                    <SceneLights />
                    <SceneCamera />
                    <CursorTracker />

                    <HexBoard />
                </Canvas>
            </div>
        </div>
    );
}

function SceneLights() {
    const dir = new THREE.Vector3(0, 0, 1).setLength(10);
    dir.applyEuler(new THREE.Euler(-45 * (Math.PI / 180), -45 * (Math.PI / 180), 0));

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
