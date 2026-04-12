"use client";

import { GameRoot, useGamePageGuard, useGamePageLifecycle } from "@/features/game";

import { Spinner } from "@radix-ui/themes";

export default function GamePage() {
    useGamePageLifecycle();

    const { isAllowed, loading } = useGamePageGuard();

    return (
        <div className="flex grow">
            {loading ? (
                <div className="m-auto">
                    <Spinner />
                </div>
            ) : isAllowed ? (
                <GameRoot />
            ) : null}
        </div>
    );
}
