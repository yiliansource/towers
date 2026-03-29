"use client";

import { Spinner } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LobbySocketProvider } from "@/lib/providers/lobby-socket.provider";
import { useLobbyStore } from "@/lib/stores/lobby.store";
import { createLogger } from "@/lib/util/logger";

import { LobbyCreateJoinForm } from "./components/lobby-create-join-form";
import { LobbyScreen } from "./components/lobby-screen";

const logger = createLogger("lobby-switch");

export function LobbySwitch() {
    const { lobby, loading, hydrateLobby } = useLobbyStore();

    const router = useRouter();

    useEffect(() => {
        void hydrateLobby();
    }, []);

    useEffect(() => {
        if (lobby && lobby.state !== "WAITING") {
            logger.log("game already started, rerouting");
            router.push("/game");
        }
    }, [lobby, lobby?.state]);

    return loading ? (
        <Spinner />
    ) : !lobby ? (
        <LobbyCreateJoinForm />
    ) : (
        <LobbySocketProvider>
            <LobbyScreen />
        </LobbySocketProvider>
    );
}
