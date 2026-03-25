import { CrownIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { LobbyView, UserView } from "@towers/shared";

import { cn } from "@/lib/cn";

export interface LobbySlotProps {
    slotIndex: number;
    user: UserView | null;
    lobby: LobbyView;
}

const slotColors: [string, string][] = [
    ["bg-[#496231]", "bg-[#577538]"],
    ["bg-[#753735]", "bg-[#9c413e]"],
    ["bg-red-400", "bg-red-500"],
    ["bg-red-400", "bg-red-500"],
];

export function LobbySlotProps({ slotIndex, user, lobby }: LobbySlotProps) {
    return (
        <div className="relative shadow py-3 px-3 h-22 w-40 bg-(--gray-2) select-none overflow-hidden">
            <AnimatePresence initial={false}>
                {user && (
                    <motion.p
                        key="username"
                        className="relative z-10 text-lg font-bold text-shadow-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                    >
                        {user.username}
                    </motion.p>
                )}
                {user && user.id === lobby.hostUserId && (
                    <motion.div
                        key="crown"
                        className="absolute left-0 bottom-0 m-3 z-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                    >
                        <CrownIcon className="text-amber-400" />
                    </motion.div>
                )}
                {user && (
                    <motion.div
                        key="connected"
                        className={cn(
                            "absolute top-0 right-0 m-2 size-2 rounded-full z-20 transition-color duration-100",
                            user?.connected ? "bg-green-500" : "bg-gray-700",
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                    ></motion.div>
                )}

                {user && (
                    <motion.div
                        key="background"
                        className={cn(
                            "absolute size-50 rotate-45 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden pointer-events-none",
                            slotColors[slotIndex][1],
                        )}
                        initial={{ x: -200 }}
                        animate={{ x: 0 }}
                        exit={{ x: 200 }}
                        transition={{
                            duration: 0.2,
                            ease: "easeInOut",
                        }}
                    >
                        <div className={cn("absolute right-0 w-10 h-full z-5", slotColors[slotIndex][0])}></div>
                        <div className={cn("absolute right-12 w-2 h-full z-5", slotColors[slotIndex][0])}></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
