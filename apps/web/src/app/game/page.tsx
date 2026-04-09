"use client";

import { Spinner } from "@radix-ui/themes";

import { GameRoot, useGamePageGuard, useGamePageLifecycle } from "@/features/game";

export default function GamePage() {
    useGamePageLifecycle();

    const { isAllowed, loading } = useGamePageGuard();

    if (loading) {
        return (
            <div className="m-auto">
                <Spinner />
            </div>
        );
    }

    if (!isAllowed) {
        return null;
    }

    return <GameRoot />;
}
