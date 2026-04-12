import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { useGameStore } from "../store/game.store";

export function GameHudOverlay() {
    const gameContext = useGameStore((s) => s.context!);

    const [showPhaseBanner, setShowPhaseBanner] = useState(false);

    // biome-ignore lint/correctness/useExhaustiveDependencies: need to re-render on changes
    useEffect(() => {
        setShowPhaseBanner(true);
        const timeout = setTimeout(() => setShowPhaseBanner(false), 3000);

        return () => {
            clearTimeout(timeout);
        };
    }, [gameContext.phase, gameContext.innerPhaseIndex]);

    return (
        <AnimatePresence>
            {showPhaseBanner && (
                <motion.div
                    key={
                        gameContext.phase +
                        (gameContext.phase === "PLAYING" ? `-${gameContext.innerPhaseIndex}` : "")
                    }
                    className="absolute top-1/2 -translate-y-1/2 left-0 right-0 bg-black/70 py-6 text-center"
                    initial={{ opacity: 0, y: 50, transition: { ease: "easeInOut" } }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50, transition: { ease: "easeInOut" } }}
                    transition={{
                        duration: 0.4,
                    }}
                >
                    {gameContext.phase === "SETUP" ? (
                        <p className="text-4xl font-bold">Setup Phase</p>
                    ) : gameContext.phase === "PLAYING" ? (
                        <>
                            <p className="text-4xl font-bold">Playing Phase</p>
                            <p>Phase {gameContext.innerPhaseIndex + 1}</p>
                        </>
                    ) : null}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
