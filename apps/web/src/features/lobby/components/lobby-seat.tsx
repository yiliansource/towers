"use client";

import Color from "color";
import { CrownIcon, PaletteIcon, UserRoundXIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";

import { LobbySeatView, SlotColor } from "@towers/shared/contracts";

import { cn } from "@/common/util/cn";
import { getSlotColorValue } from "@/common/util/color";
import { useAuthStore } from "@/features/auth";

import { useLobbyCommands } from "../realtime/use-lobby-commands";
import { useLobbyStore } from "../store/lobby.store";
import { useIsHostUser } from "../store/use-lobby-derived";

export interface LobbySeatProps {
    seat: LobbySeatView;

    onClick?: () => void;
}

export function LobbySeat({ seat, onClick }: LobbySeatProps) {
    const lobby = useLobbyStore((s) => s.lobby!);
    const user = useAuthStore((s) => s.user!);
    const [actionsOpen, setActionsOpen] = useState(false);
    const [cosmeticsOpen, setCosmeticsOpen] = useState(false);

    const isSelf = seat.user?.id === user?.id;
    const isHost = useIsHostUser();

    const slotColorString = getSlotColorValue(seat.color);
    const slotColor = Color(slotColorString);
    const slotAccentColor = slotColor.darken(0.2);

    const colorsInUse = lobby.seats.filter((s) => !!s.user).map((s) => s.color);

    const { chooseColor, promoteSlot, kickSlot } = useLobbyCommands();

    const handleChooseColor = (color: SlotColor) => {
        if (isSelf && !colorsInUse.includes(color)) {
            void chooseColor(color);
        }
    };

    useEffect(() => {
        if (!seat.user) setCosmeticsOpen(false);
    }, [seat.user]);

    return (
        <div
            className={cn(
                "relative shadow py-3 px-3 h-22 w-full lg:w-40 bg-(--gray-2) select-none overflow-hidden",
                !seat.user && "cursor-pointer",
                seat.user && !seat.user.connected && "opacity-30 grayscale-75",
            )}
            onPointerEnter={() => setActionsOpen(true)}
            onPointerLeave={() => {
                setActionsOpen(false);
                setCosmeticsOpen(false);
            }}
            onClick={onClick}
        >
            <AnimatePresence initial={false}>
                {seat.user && (
                    <motion.span
                        key="username"
                        className="relative z-10 text-lg font-bold text-shadow-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                    >
                        {seat.user.username}
                    </motion.span>
                )}
                {seat.user && seat.user.id === lobby.host.id && (
                    <motion.div
                        key="crown"
                        className="absolute left-0 bottom-0 m-2 z-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                    >
                        <CrownIcon className="text-amber-400" />
                    </motion.div>
                )}
                {seat.user && (
                    <div key="background" className="absolute top-0 left-0 w-full h-full">
                        <motion.div
                            style={{ backgroundColor: slotColor.hex() }}
                            className={cn(
                                "absolute size-75 lg:size-50 rotate-45 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden pointer-events-none transition-colors",
                            )}
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: 300 }}
                            transition={{
                                duration: 0.2,
                                ease: "easeInOut",
                            }}
                        >
                            <div
                                style={{ backgroundColor: slotAccentColor.hex() }}
                                className={cn("absolute right-0 w-10 h-full z-5 transition-colors")}
                            ></div>
                            <div
                                style={{ backgroundColor: slotAccentColor.hex() }}
                                className={cn("absolute right-12 w-2 h-full z-5 transition-colors")}
                            ></div>
                        </motion.div>
                    </div>
                )}
                {actionsOpen && !cosmeticsOpen && seat.user && (
                    <motion.div
                        key="actions"
                        className="absolute p-2 bottom-0 right-0 drop-shadow-sm"
                        initial={{ translateY: "100%", opacity: 0 }}
                        animate={{ translateY: 0, opacity: 1 }}
                        exit={{ translateY: "100%", opacity: 0 }}
                        transition={{ ease: "easeInOut", duration: 0.2 }}
                    >
                        <div className="flex flex-row gap-2">
                            {isSelf && (
                                <SeatActionButton action={() => setCosmeticsOpen(true)}>
                                    <PaletteIcon className="" />
                                </SeatActionButton>
                            )}
                            {!isSelf && isHost && (
                                <SeatActionButton action={() => void promoteSlot(seat.slot)}>
                                    <CrownIcon className="text-amber-400" />
                                </SeatActionButton>
                            )}
                            {!isSelf && isHost && (
                                <SeatActionButton action={() => void kickSlot(seat.slot)}>
                                    <UserRoundXIcon className="text-red-400" />
                                </SeatActionButton>
                            )}
                        </div>
                    </motion.div>
                )}
                {cosmeticsOpen && (
                    <motion.div
                        key="cosmetics"
                        className="absolute p-2 bg-black/40 top-0 right-0 bottom-0"
                        initial={{ translateX: "100%", opacity: 0 }}
                        animate={{ translateX: 0, opacity: 1 }}
                        exit={{ translateX: "100%", opacity: 0 }}
                        transition={{ ease: "easeInOut", duration: 0.2 }}
                    >
                        <div className="flex flex-col h-full">
                            <div
                                className="p-1 -m-1 ml-auto mb-auto cursor-pointer"
                                onClick={() => void setCosmeticsOpen(false)}
                            >
                                <XIcon className="size-4" />
                            </div>
                            <div className="mt-auto mb-0 grid grid-cols-4 gap-1">
                                {Object.values(SlotColor).map((c) => {
                                    const color = Color(getSlotColorValue(c));

                                    return (
                                        <div
                                            key={c}
                                            style={{
                                                backgroundColor: color.hex(),
                                                borderColor: color.darken(0.5).hex(),
                                            }}
                                            onClick={() => handleChooseColor(c)}
                                            className={cn(
                                                "size-4 rounded-full border",
                                                !colorsInUse.includes(c)
                                                    ? "cursor-pointer"
                                                    : "opacity-50 grayscale-100",
                                            )}
                                        ></div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
                {/* {actionsOpen && seat.user && (
                    <motion.div
                        key="actions"
                        className="absolute p-2 top-0 right-0 bottom-0 bg-black/30"
                        initial={{ translateX: "100%", opacity: 0 }}
                        animate={{ translateX: 0, opacity: 1 }}
                        exit={{ translateX: "100%", opacity: 0 }}
                        transition={{ ease: "easeInOut", duration: 0.2 }}
                    >
                        <div className="flex flex-col gap-1">
                            {!isSelf && isHost && (
                                <SeatActionButton action={() => void promoteSlot(seat.slot)} icon={CrownIcon} />
                            )}
                            {!isSelf && isHost && (
                                <SeatActionButton action={() => void kickSlot(seat.slot)} icon={UserRoundXIcon} />
                            )}
                        </div>
                    </motion.div>
                )} */}
            </AnimatePresence>
        </div>
    );
}

function SeatActionButton({ action, children }: { action: () => void; children: React.ReactNode }) {
    return (
        <div className="cursor-pointer size-5" onClick={action}>
            {children}
        </div>
    );
}
