import { Button, Text } from "@radix-ui/themes";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useMemo } from "react";

import { LobbySeatView, SlotColor } from "@towers/shared/contracts";

import { cn } from "@/common/util/cn";
import { getSlotColorValue } from "@/common/util/color";
import { useAuthStore } from "@/features/auth";
import { useIsHostUser, useLobbyStore } from "@/features/lobby";

import { useGameCommands } from "../realtime/use-game-commands";
import { useGameStore } from "../store/game.store";
import { useIsInTurn } from "../store/use-game-derived";

export function GameHud() {
    const { lobby } = useLobbyStore();
    const { game, ui } = useGameStore();

    if (!lobby) throw new Error("Lobby was not loaded.");
    if (!game) throw new Error("Game was not loaded.");

    const isHostUser = useIsHostUser();
    const isInTurn = useIsInTurn();

    const { abortGame, endTurn } = useGameCommands();

    useEffect(() => {
        if (isInTurn) console.log("turn started");
        else console.log("turn ended");
    }, [isInTurn]);

    const phaseDescription = useMemo<PhaseDescription | null>(() => {
        if (game.ctx.phase === "SETUP") {
            const phaseTitle = "Setup Phase";
            const children: React.ReactElement[] = [];

            children.push(
                <Text key="1" as="p">
                    The players choose initial positions for their knights.
                </Text>,
            );
            if (isInTurn) {
                children.push(
                    <Text key="2" mt="1" as="p" weight="bold">
                        Click on a tower to place your knight.
                    </Text>,
                );
            }

            return {
                title: phaseTitle,
                content: children,
            };
        }

        return null;
    }, [game.ctx.phase, isInTurn]);

    return (
        <div className="relative flex flex-col min-h-0">
            <h1 className="mt-8 mb-10 leading-none font-fruktur text-[70px] text-center">towers</h1>
            <div className="flex flex-col gap-2 select-none">
                {lobby.seats.map((s) => (
                    <PlayerSlot key={s.slot} seat={s} />
                ))}
            </div>

            <div className="mt-auto mb-0">
                <div className="w-full">
                    {game.ctx.phase === "PLAYING" && (
                        <Button className="mb-2! w-full!" disabled={!isInTurn} onClick={() => void endTurn()}>
                            End turn
                        </Button>
                    )}
                    {isHostUser && (
                        <Button className="mb-2! w-full!" onClick={() => void abortGame()}>
                            Abort game
                        </Button>
                    )}
                </div>
            </div>

            <div className="absolute left-[calc(100%+1em)] z-50">
                <AnimatePresence>
                    {phaseDescription && (
                        <motion.div
                            className="m-4 py-4 px-4 bg-(--gray-3) w-md shadow"
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <AnimatePresence>
                                <h1 key={phaseDescription.title} className="font-bold text-4xl mb-4">
                                    {phaseDescription.title}
                                </h1>
                                {phaseDescription.content.map((c) => (
                                    <motion.div
                                        key={c.key}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {c}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function PlayerSlot({ seat }: { seat: LobbySeatView }) {
    const user = useAuthStore((s) => s.user!);
    const lobby = useLobbyStore((s) => s.lobby!);
    const game = useGameStore((s) => s.game!);

    const isSelf = user.id === seat.user?.id;
    const isInTurn = game.ctx.currentPlayerId === seat.user?.id;
    const color = getSlotColorValue(seat.color);

    return (
        <div
            className={cn(
                "transition-[opacity,background-color] duration-150 border-4 border-(--gray-3) p-2",
                seat.user && !seat.user.connected && "opacity-30 grayscale-75",
            )}
            style={{ borderColor: seat.user ? color : "", background: isInTurn ? color : "transparent" }}
        >
            {seat.user ? (
                <>
                    <p className={cn(isSelf && "font-bold")}>{seat.user?.username}</p>
                </>
            ) : (
                <p className="text-(--gray-6) italic">empty</p>
            )}
        </div>
    );
}

interface PhaseDescription {
    title: string;
    content: React.ReactElement[];
}
