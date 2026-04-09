"use client";

import { Button } from "@radix-ui/themes";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { TowersBanner } from "@/common/ui/towers-banner";
import { createLogger } from "@/common/util/logger";

import { useLobbyCommands } from "../realtime/use-lobby-commands";
import { useLobbyEvents } from "../realtime/use-lobby-events";
import { useLobbyStore } from "../store/lobby.store";
import { useIsHostUser } from "../store/use-lobby-derived";
import { LobbySeat } from "./lobby-seat";

const logger = createLogger("lobby-screen");

export function LobbyScreen() {
    useLobbyEvents();

    const [lobbyIdCopied, setLobbyIdCopied] = useState(false);

    const lobby = useLobbyStore((s) => s.lobby!);
    const { leaveLobby, messageLobby, startGame, switchSlot } = useLobbyCommands();

    const isHostUser = useIsHostUser();

    const handleCopyLobbyIdClick = async () => {
        try {
            await navigator.clipboard.writeText(lobby.publicId);
            setLobbyIdCopied(true);

            setTimeout(() => setLobbyIdCopied(false), 1500);
        } catch (err) {
            logger.error("Failed to copy lobby ID:", err);
        }
    };

    return (
        <div className="m-auto py-12 flex flex-col items-center">
            <TowersBanner className="mb-10" />
            <div className="min-w-0 flex flex-col justify-stretch">
                <div className="mb-2 flex flex-row justify-between">
                    <div className="flex flex-col items-start">
                        <p className="text-sm text-(--gray-8)">Status</p>
                        <p>
                            {lobby.seats.filter((s) => !!s.user).length < 2 ? (
                                <span>Waiting for players...</span>
                            ) : (
                                <span>
                                    Waiting for host <b>{lobby.host.username}</b> to start the game ...
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-sm text-(--gray-8)">Lobby ID</p>
                        <div className="flex flex-row gap-1 items-center">
                            <span>{lobby.publicId} </span>
                            <span onClick={handleCopyLobbyIdClick} className="cursor-pointer">
                                {lobbyIdCopied ? (
                                    <CheckIcon className="size-4 text-green-400" />
                                ) : (
                                    <CopyIcon className="size-4 opacity-40 hover:opacity-70" />
                                )}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="mb-4 flex flex-col md:flex-row gap-3">
                    {lobby.seats.map((s) => (
                        <LobbySeat key={s.slot} seat={s} onClick={() => void switchSlot(s.slot)} />
                    ))}
                </div>
                <div className="flex flex-row items-center justify-end gap-2">
                    <Button variant="outline" onClick={() => void leaveLobby()}>
                        Leave
                    </Button>
                    <Button
                        disabled={!isHostUser || lobby.seats.filter((s) => !!s.user).length < 2}
                        onClick={() => void startGame()}
                    >
                        Start Game
                    </Button>
                </div>
            </div>
        </div>
    );
}
