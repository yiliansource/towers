import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Spinner, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { LobbyView } from "@towers/shared";

import { FormError } from "@/components/forms/FormError";
import { FormLabel } from "@/components/forms/FormLabel";
import { fetchApi } from "@/lib/api";
import { useLobbyStore } from "@/stores/lobby.store";

export const joinLobbySchema = z.object({
    lobbyId: z
        .string()
        .length(4, "Lobby ID must be 4 characters long.")
        .regex(/[A-Z]/, "Lobby ID must only consist of A-Z."),
});

export type JoinLobbyInput = z.infer<typeof joinLobbySchema>;

export function LobbyCreateJoinForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<JoinLobbyInput>({
        resolver: zodResolver(joinLobbySchema),
    });

    const { setLobby } = useLobbyStore();

    const onCreateSubmit = async () => {
        setIsSubmitting(true);

        try {
            const res = await fetchApi("/lobby/create", { method: "POST" });
            if (!res.ok) return;

            const lobby = (await res.json()) as LobbyView;
            setLobby(lobby);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onJoinSubmit: SubmitHandler<JoinLobbyInput> = async (data) => {
        setIsSubmitting(true);

        try {
            const res = await fetchApi(`/lobby/${data.lobbyId}/join`, { method: "POST" });
            if (!res.ok) return;

            const lobby = (await res.json()) as LobbyView;
            setLobby(lobby);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-row items-center">
            <div>
                <p className="mb-2">Create a new lobby.</p>
                <Button onClick={onCreateSubmit} disabled={isSubmitting}>
                    {isSubmitting ? <Spinner /> : <span>Create Lobby</span>}
                </Button>
            </div>
            <div className="mx-14 py-4 self-stretch">
                <div className="w-px h-full bg-(--gray-7)"></div>
            </div>
            <form onSubmit={handleSubmit(onJoinSubmit)}>
                <p className="mb-2">Join an existing lobby.</p>
                <div className="mb-4">
                    <FormLabel>Lobby ID</FormLabel>
                    <TextField.Root {...register("lobbyId")} autoComplete="off" placeholder="ABCD" />
                    <FormError className="mt-1">{errors.lobbyId?.message}</FormError>
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner /> : <span>Join Lobby</span>}
                </Button>
            </form>
        </div>
    );
}
