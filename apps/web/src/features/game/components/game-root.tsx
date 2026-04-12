"use client";

import { GameScene } from "@/features/game";

import { useWindowSize } from "@uidotdev/usehooks";

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
