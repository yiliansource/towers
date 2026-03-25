import { Button } from "@radix-ui/themes";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { UserView } from "@towers/shared/contracts/auth";

import { useSocket } from "@/components/socket-provider";
import { fetchApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useLobbyStore } from "@/stores/lobby.store";

import { LobbySlotProps } from "./lobby-slot";

export function LobbyScreen() {
    const { lobby, setLobby } = useLobbyStore();
    if (!lobby) throw new Error();

    const { user } = useAuthStore();
    if (!lobby) throw new Error();
    const isHostUser = lobby.hostUserId === user?.id;

    const socket = useSocket();

    const handleLeave = async () => {
        const res = await fetchApi("/lobby/current/leave", { method: "POST" });
        if (!res.ok) return;

        setLobby(null);
    };

    const [lobbyIdCopied, setLobbyIdCopied] = useState(false);
    const handleCopyLobbyIdClick = async () => {
        try {
            await navigator.clipboard.writeText(lobby.publicId);
            setLobbyIdCopied(true);

            setTimeout(() => setLobbyIdCopied(false), 1500);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    useEffect(() => {
        socket.emit("lobby:subscribe", { lobbyId: lobby.id });
        socket.on("lobby:state", (state) => setLobby(state));
        socket.on("lobby:removed", () => {
            setLobby(null);
            console.warn("you have been removed from the lobby.");
        });

        socket.connect();

        return () => {
            socket.off("lobby:state");
            socket.emit("lobby:unsubscribe", { lobbyId: lobby.id });

            socket.disconnect();
        };
    }, [lobby.id]);

    const handleKickUser = async (targetUserId: string) => {
        await fetchApi("/lobby/current/kick/" + targetUserId, {
            method: "POST",
        });
    };

    const handleStartGame = async () => {
        await fetchApi("/lobby/current/start", {
            method: "POST",
        });
    };

    return (
        <div className="flex flex-col justify-stretch">
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
            <div className="mb-4 flex flex-row gap-3">
                {(lobby.users as (UserView | null)[]).concat(Array(4 - lobby.users.length).fill(null)).map((u, i) => (
                    <LobbySlotProps key={i} slotIndex={i} user={u} lobby={lobby} />
                ))}
            </div>
            <div className="flex flex-row items-center justify-end gap-2">
                <Button variant="outline" onClick={handleLeave}>
                    Leave
                </Button>
                <Button disabled={!isHostUser || lobby.users.length < 2} onClick={handleStartGame}>
                    Start Game
                </Button>
            </div>

            {/* <pre className="text-sm">
                <code>{JSON.stringify(lobby, null, 2)}</code>
            </pre> */}
        </div>
    );
}
