import { Button } from "@radix-ui/themes";
import { Canvas } from "@react-three/fiber";

import { DebugJson } from "@/components/debug-json";
import { DevOnly } from "@/components/dev-only";
import { useGameSocket } from "@/lib/hooks/use-game-socket";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useGameStore } from "@/lib/stores/game.store";
import { useLobbyStore } from "@/lib/stores/lobby.store";
import { cn } from "@/lib/util/cn";

import { HexBoard } from "./hex-board";
import { SceneCamera } from "./scene-camera";

export function GameScene() {
    const { lobby } = useLobbyStore();
    const { user } = useAuthStore();
    const { game } = useGameStore();

    const { socket, connected, finishGame } = useGameSocket();

    const towers = useGameStore((s) => s.game?.towers);

    const handleFinishGame = async () => {
        void finishGame();
    };

    if (!lobby) return null;
    if (!user) return null;
    if (!game) return null;

    const isHostUser = lobby.host.id === user.id;

    return (
        <div className="grow grid md:grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 grid-flow-row">
            <div className="flex flex-col">
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
                        <Button className="mb-2! w-full!" disabled={!isHostUser} onClick={handleFinishGame}>
                            Finish game
                        </Button>
                    </div>
                    <DevOnly>
                        <DebugJson object={game} />
                    </DevOnly>
                </div>
            </div>

            <div className="border border-(--gray-3) relative">
                <Canvas className="absolute inset-0">
                    <SceneLights />
                    <SceneCamera />
                    <HexBoard towerKeys={towers ?? []} />
                </Canvas>
            </div>
        </div>
    );
}

function SceneLights() {
    return (
        <>
            <ambientLight intensity={1} />
            <directionalLight intensity={3} position={[-10, 10, 5]} />
        </>
    );
}
