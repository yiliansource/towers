"use client";

import { Spinner } from "@radix-ui/themes";

import { createLogger } from "@/common/util/logger";
import {
    LobbyEntryScreen,
    LobbyRoot,
    useLobbyPageGuard,
    useLobbyPageLifecycle,
    useLobbyStore,
} from "@/features/lobby";

const _logger = createLogger("lobby-page");

export default function LobbyPage() {
    useLobbyPageLifecycle();

    const lobby = useLobbyStore((s) => s.lobby);
    const { isAllowed, loading } = useLobbyPageGuard();

    if (loading) {
        return (
            <div className="m-auto">
                <Spinner />
            </div>
        );
    }

    if (!lobby) {
        return <LobbyEntryScreen />;
    }

    if (!isAllowed) {
        return null;
    }

    return <LobbyRoot />;
}
