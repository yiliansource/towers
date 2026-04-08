import { Button } from "@radix-ui/themes";
import { PerformanceMonitor, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { produce } from "immer";

import { stringifyAxial } from "@towers/shared/hexgrid";

import { DebugJson } from "@/components/debug-json";
import { DevOnly } from "@/components/dev-only";
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

    const towers = useGameStore((s) => s.game?.towers);

    const handleEndTurn = async () => {
        void endTurn();
    };

    if (!lobby) return null;
    if (!user) return null;
    if (!game) return null;

    const isHostUser = lobby.host.id === user.id;
    const isInTurn = game.ctx.currentPlayerId === user.id;

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
                        <DebugJson object={ui} />
                    </DevOnly>
                </div>
            </div>

            <div className="border border-(--gray-3) relative min-h-0 h-full overflow-hidden">
                <Canvas className="absolute inset-0">
                    <Stats />

                    <SceneLights />
                    <SceneCamera />
                    <CursorTracker />

                    <HexBoard towerPositions={towers ?? []} />
                </Canvas>
            </div>
        </div>
    );
}

function SceneLights() {
    return (
        <>
            <ambientLight intensity={0.8} />
            <directionalLight intensity={2} position={[-10, 10, 5]} />
        </>
    );
}
