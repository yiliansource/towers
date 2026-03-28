import { Button } from "@radix-ui/themes";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

import { useSocket } from "@/components/socket-provider";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useGameStore } from "@/lib/stores/game.store";
import { useLobbyStore } from "@/lib/stores/lobby.store";
import { fetchApi } from "@/lib/util/fetch-api";

import { HexBoard } from "./hex-board";

export function GameScene() {
    const { lobby } = useLobbyStore();
    const { user } = useAuthStore();
    const { game } = useGameStore();

    const router = useRouter();
    const socket = useSocket();

    useEffect(() => {
        if (!lobby) return;
        if (!game) return;

        socket.on("lobby:finish", () => {
            router.push("/lobby");
        });

        socket.connect();

        return () => {
            socket.off("lobby:finish");

            if (socket.connected) socket.disconnect();
        };
    }, [lobby?.id, game?.gameId]);

    if (!lobby) return null;
    if (!user) return null;
    if (!game) return null;

    const isHostUser = lobby.host.id === user.id;

    const towers = useGameStore((s) => s.game!.towers);
    const tileKeys = useMemo(() => Object.keys(towers ?? {}), [towers]);

    const finishGame = async () => {
        fetchApi("/lobby/finish", { method: "POST" });
    };

    return (
        <>
            <Canvas>
                <SceneLights />
                <SceneCamera />
                <HexBoard tileKeys={tileKeys} />
            </Canvas>
            <Button disabled={!isHostUser} onClick={finishGame}>
                Finish game
            </Button>
        </>
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
