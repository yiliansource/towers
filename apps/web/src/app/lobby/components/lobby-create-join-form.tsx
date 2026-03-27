import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Spinner, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { JoinLobbyInput, JoinLobbySchema, LobbyView } from "@towers/shared/contracts/lobby";

import { FormError } from "@/components/forms/FormError";
import { FormLabel } from "@/components/forms/FormLabel";
import { fetchApi } from "@/lib/fetch-api";
import { useLobbyStore } from "@/stores/lobby.store";

export function LobbyCreateJoinForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<JoinLobbyInput>({
        resolver: zodResolver(JoinLobbySchema),
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
            const res = await fetchApi(`/lobby/join/${data.lobbyId}`, { method: "POST" });
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
        <div className="w-full flex flex-col lg:flex-row items-start lg:items-center">
            <div>
                <p className="mb-2">Create a new lobby.</p>
                <Button onClick={onCreateSubmit} disabled={isSubmitting}>
                    {isSubmitting ? <Spinner /> : <span>Create Lobby</span>}
                </Button>
            </div>
            <div className="mx-4 lg:mx-14 my-8 lg:my-4 self-stretch">
                <div className="h-px w-full lg:w-px lg:h-full bg-(--gray-7)"></div>
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
