import type { GameAction, LobbySeatView } from "@towers/shared/contracts";
import { getSlotColorValue } from "@towers/shared/util";

import { DebugJson } from "@/common/ui/debug-json";
import { DevOnly } from "@/common/ui/dev-only";
import { cn } from "@/common/util/cn";
import { useAuthStore } from "@/features/auth";
import { useIsHostUser, useLobbyStore } from "@/features/lobby";

import { Button } from "@radix-ui/themes";
import React from "react";

import { useGameCommands } from "../realtime/use-game-commands";
import { useGameStore } from "../store/game.store";
import { useIsInTurn, usePlayerResources } from "../store/use-game-derived";

export function GameSidebarInterface() {
    const lobby = useLobbyStore((s) => s.lobby!);

    const gameContext = useGameStore((s) => s.context!);

    const isHostUser = useIsHostUser();
    const isInTurn = useIsInTurn();
    const resources = usePlayerResources()!;

    const actionState = useGameStore((s) => s.actionState);
    const availableActions = useGameStore((s) => s.availableActions);

    const { abortGame: handleAbortGame, endTurn: handleEndTurn } = useGameCommands();

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

            <DevOnly>
                {/* <DebugJson className="mb-2 basis-3xl" object={gameContext} /> */}
                <DebugJson className="mb-2 basis-3xl" object={availableActions} />
                <DebugJson className="mb-2 basis-3xl" object={actionState} />
            </DevOnly>

            {gameContext.phase === "PLAYING" && isInTurn && (
                <div className="mb-2">
                    <p>Remaining action points: {resources.actionPoints}</p>
                </div>
            )}

            <div className="">
                <div className="w-full">
                    {gameContext.phase === "PLAYING" && (
                        <>
                            <div className="flex flex-col gap-2">
                                <ActionButton actionName="placeUnit">Place Unit (2AP)</ActionButton>
                                <ActionButton actionName="placeTower">
                                    Place Tower (1AP, max. 2 per turn)
                                </ActionButton>
                                <ActionButton actionName="moveUnit">
                                    Move Knight (1AP per distance)
                                </ActionButton>
                            </div>
                            <div className="my-4 border-b border-(--gray-6)"></div>
                            <Button
                                className={cn(
                                    "mb-2! w-full!",
                                    isInTurn &&
                                        resources.actionPoints <= 0 &&
                                        "outline-3! outline-yellow-300!",
                                )}
                                disabled={!isInTurn}
                                onClick={() => void handleEndTurn()}
                            >
                                End turn
                            </Button>
                        </>
                    )}
                    {isHostUser && (
                        <>
                            <div className="my-4 border-b border-(--gray-6)"></div>

                            <Button
                                className="w-full!"
                                variant="outline"
                                color="red"
                                onClick={() => void handleAbortGame()}
                            >
                                Abort game
                            </Button>
                        </>
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

function ActionButton({
    actionName,
    children,
}: {
    actionName: GameAction["name"];
    children: React.ReactNode;
}) {
    const resources = usePlayerResources()!;
    const isInTurn = useIsInTurn();

    const actionState = useGameStore((s) => s.actionState);
    const actionActive = actionState?.action.name === actionName;

    const action = useGameStore((s) => s.availableActions.find((a) => a.name === actionName));
    const disabled =
        !action ||
        (!!actionState && !actionActive) ||
        !isInTurn ||
        (action.cost.type === "fixed" && action.cost.amount > resources.actionPoints);

    const startAction = useGameStore((s) => s.startAction);
    const clearAction = useGameStore((s) => s.clearAction);

    const handleClick = () => {
        if (disabled) return;

        if (actionActive && (!(typeof action.forced === "boolean") || !action.forced)) {
            clearAction();
        } else {
            startAction(actionName);
        }
    };

    return (
        <Button className="w-full!" disabled={disabled} onClick={handleClick}>
            {!actionActive ? children : <span>Cancel</span>}
        </Button>
    );
}
