"use client";

import {
    LobbyEntryScreen,
    LobbyRoot,
    useLobbyPageGuard,
    useLobbyPageLifecycle,
    useLobbyStore,
} from "@/features/lobby";

import { Spinner } from "@radix-ui/themes";

export default function LobbyPage() {
    useLobbyPageLifecycle();

    const lobby = useLobbyStore((s) => s.lobby);
    const { isAllowed, loading } = useLobbyPageGuard();

    const content = loading ? (
        <Spinner key="loading" className="m-auto" />
    ) : !lobby ? (
        <LobbyEntryScreen key="entry" />
    ) : isAllowed ? (
        <LobbyRoot key="lobby" />
    ) : null;

    return <div className="flex grow">{content}</div>;
}
