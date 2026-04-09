"use client";

import { useWindowSize } from "@uidotdev/usehooks";

import { GameScene } from "@/features/game";

export function GameRoot() {
    const windowSize = useWindowSize();

    if ((windowSize.width ?? 0) < 1024) {
        return (
            <div className="m-auto">
                <p>Small screens are not supported yet. Sorry!</p>
            </div>
        );
    }

    return <GameScene />;
}
