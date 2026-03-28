"use client";

import { Button } from "@radix-ui/themes";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useLobbySocket } from "@/lib/hooks/use-lobby-socket";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useLobbyStore } from "@/lib/stores/lobby.store";
import { fetchApi } from "@/lib/util/fetch-api";

import { LobbySeat } from "./lobby-seat";

export function LobbyScreen() {
    const { lobby, setLobby } = useLobbyStore();
    const { socket, connected, startGame, switchSlot } = useLobbySocket();
    const { user } = useAuthStore();

    const router = useRouter();

    const [lobbyIdCopied, setLobbyIdCopied] = useState(false);

    useEffect(() => {
        if (!lobby) return;

        socket.on("lobby:state", (state) => setLobby(state));
        socket.on("lobby:removed", () => {
            setLobby(null);
            console.warn("you have been removed from the lobby.");
        });
        socket.on("lobby:start", () => {
            router.push("/game");
        });

        socket.connect();

        return () => {
            socket.off("lobby:state");

            if (socket.connected) socket.disconnect();
        };
    }, [lobby?.id]);

    if (!lobby) return null;
    if (!user) return null;

    const isHostUser = lobby.host.id === user.id;

    const handleLeave = async () => {
        const res = await fetchApi("/lobby/leave", { method: "POST" });
        if (!res.ok) return;

        setLobby(null);
    };

    const handleCopyLobbyIdClick = async () => {
        try {
            await navigator.clipboard.writeText(lobby.publicId);
            setLobbyIdCopied(true);

            setTimeout(() => setLobbyIdCopied(false), 1500);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleSlotSwitch = async (slot: number) => {
        if (!!lobby.seats.find((s) => s.slot === slot)!.user) return;

        await fetchApi("/lobby/switch-slot/" + slot, {
            method: "POST",
        });
    };

    const handleKickUser = async (targetUserId: string) => {
        await fetchApi("/lobby/kick/" + targetUserId, {
            method: "POST",
        });
    };

    const handleStartGame = async () => {
        await fetchApi("/lobby/start", {
            method: "POST",
        });
    };

    return (
        <div className="w-full flex flex-col justify-stretch">
            <div className="mb-2 flex flex-row justify-between">
                <div className="flex flex-col items-start">
                    <p className="text-sm text-(--gray-8)">Status</p>
                    <p>Waiting for players...</p>
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
                    <LobbySeat
                        key={s.slot}
                        slotIndex={s.slot}
                        user={s.user}
                        lobby={lobby}
                        onClick={() => handleSlotSwitch(s.slot)}
                    />
                ))}
            </div>
            <div className="flex flex-row items-center justify-end gap-2">
                <Button variant="outline" onClick={handleLeave}>
                    Leave
                </Button>
                <Button
                    disabled={!isHostUser || lobby.seats.filter((s) => !!s.user).length < 2}
                    onClick={handleStartGame}
                >
                    Start Game
                </Button>
            </div>

            {/* <pre className="text-sm">
                <code>{JSON.stringify(lobby, null, 2)}</code>
            </pre> */}
        </div>
    );
}
