import { useEffect, useState } from "react";

import { LobbyView } from "@towers/shared";

import { fetchApi } from "@/lib/api";
import { useLobbyStore } from "@/stores/lobby.store";

import { Button } from "./button";

export function LobbyJoinCreateForm() {
    const [lobbyIdInput, setLobbyIdInput] = useState<string>("");
    const { setLobby } = useLobbyStore();

    useEffect(() => {
        void (async function () {
            const res = await fetchApi("/lobby/current");
            if (res.ok) {
                const lobby = (await res.json()) as LobbyView | null;
                setLobby(lobby);
            }
        })();
    }, []);

    const handleCreateLobby = async () => {
        const res = await fetchApi(`/lobby/create`, {
            method: "POST",
        });
        const lobby = (await res.json()) as LobbyView | null;
        setLobby(lobby);
    };
    const handleJoinLobby = async () => {
        const res = await fetchApi(`/lobby/${lobbyIdInput}/join`, {
            method: "POST",
        });
        if (!res.ok) return;

        const r = (await res.json()) as LobbyView | null;
        setLobby(r);
    };

    const handleLobbyIdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;
        newValue = newValue.substring(0, 5);
        setLobbyIdInput(newValue);
    };

    return (
        <div>
            <Button onClick={handleCreateLobby}>create a lobby</Button>
            <p className="my-6">or</p>
            <div className="flex flex-col gap-2">
                <input
                    className="w-20"
                    placeholder="lobby-id"
                    value={lobbyIdInput}
                    onChange={handleLobbyIdInputChange}
                />
                <Button className="mr-auto" onClick={handleJoinLobby}>
                    join a lobby
                </Button>
            </div>
        </div>
    );
}
