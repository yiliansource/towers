import type { LobbySeatView } from "@towers/shared/contracts";

import { DebugJson } from "@/common/ui/debug-json";
import { DevOnly } from "@/common/ui/dev-only";
import { cn } from "@/common/util/cn";
import { getSlotColorValue } from "@/common/util/color";
import { useAuthStore } from "@/features/auth";
import { useIsHostUser, useLobbyStore } from "@/features/lobby";

import { Button } from "@radix-ui/themes";

import { useGameCommands } from "../realtime/use-game-commands";
import { useGameStore } from "../store/game.store";
import { useIsInTurn, usePlayerResources } from "../store/use-game-derived";

export function GameSidebarInterface() {
    const lobby = useLobbyStore((s) => s.lobby!);

    const gameContext = useGameStore((s) => s.context!);
    const boardState = useGameStore((s) => s.boardState!);

    const isHostUser = useIsHostUser();
    const isInTurn = useIsInTurn();
    const resources = usePlayerResources()!;

    const { abortGame, endTurn } = useGameCommands();

    return (
        <div className="relative flex flex-col min-h-0">
            <h1 className="mt-8 mb-10 leading-none font-fruktur text-[70px] text-center">towers</h1>
            <div className="mb-4 flex flex-col gap-2 select-none">
                {lobby.seats
                    .filter((s) => !!s.user)
                    .map((s) => (
                        <PlayerSlot key={s.slot} seat={s} />
                    ))}
            </div>

            {gameContext.phase === "PLAYING" && isInTurn && (
                <div>
                    <p>Remaining action points: {resources.actionPoints}</p>
                </div>
            )}

            <DevOnly>
                <DebugJson className="mb-2 basis-3xl" object={gameContext} />
                <DebugJson className="mb-2 basis-3xl" object={boardState} />
            </DevOnly>

            <div className="mt-auto mb-0">
                <div className="w-full">
                    {gameContext.phase === "PLAYING" && (
                        <Button
                            className={cn(
                                "mb-2! w-full!",
                                isInTurn &&
                                    resources.actionPoints <= 0 &&
                                    "outline-3! outline-yellow-300!",
                            )}
                            disabled={!isInTurn}
                            onClick={() => void endTurn()}
                        >
                            End turn
                        </Button>
                    )}
                    {isHostUser && (
                        <Button
                            className="w-full!"
                            variant="outline"
                            color="red"
                            onClick={() => void abortGame()}
                        >
                            Abort game
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function PlayerSlot({ seat }: { seat: LobbySeatView }) {
    const user = useAuthStore((s) => s.user!);
    const gameContext = useGameStore((s) => s.context!);

    const isSelf = user.id === seat.user?.id;
    const isInTurn = gameContext.currentPlayerId === seat.user?.id;
    const color = getSlotColorValue(seat.color);

    return (
        <div
            className={cn(
                "transition-[opacity,background-color] duration-150 border-4 border-(--gray-3) p-2",
                seat.user && !seat.user.connected && "opacity-30 grayscale-75",
            )}
            style={{
                borderColor: seat.user ? color : "",
                background: isInTurn ? color : "transparent",
            }}
        >
            {seat.user ? (
                <p className={cn(isSelf && "font-bold")}>{seat.user?.username}</p>
            ) : (
                <p className="text-(--gray-6) italic">empty</p>
            )}
        </div>
    );
}
