"use client";

import { FormError } from "@/common/ui/forms/FormError";
import { FormLabel } from "@/common/ui/forms/FormLabel";
import { TowersBanner } from "@/common/ui/towers-banner";
import { createLogger } from "@/common/util/logger";
import { useLobbyStore } from "@/features/lobby";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Spinner, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { createLobby, joinLobby } from "../api/lobby-actions";
import { type JoinLobbyInput, JoinLobbySchema } from "../models/join-lobby.schema";

const logger = createLogger("lobby-entry-screen");

export function LobbyEntryScreen() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<JoinLobbyInput>({
        resolver: zodResolver(JoinLobbySchema),
    });

    const setLobby = useLobbyStore((s) => s.setLobby);

    const onCreateSubmit = async () => {
        setIsSubmitting(true);

        try {
            const lobby = await createLobby();
            setLobby(lobby);
        } catch (e) {
            logger.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onJoinSubmit: SubmitHandler<JoinLobbyInput> = async (data) => {
        setIsSubmitting(true);

        try {
            const lobby = await joinLobby(data.lobbyId);
            setLobby(lobby);
        } catch (e) {
            logger.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="m-auto flex flex-col items-center">
            <TowersBanner className="mb-10" />
            <div className="w-full flex flex-col md:flex-row items-start md:items-center">
                <div>
                    <p className="mb-2">Create a new lobby.</p>
                    <Button disabled={isSubmitting} onClick={onCreateSubmit}>
                        {isSubmitting ? <Spinner /> : <span>Create Lobby</span>}
                    </Button>
                </div>
                <div className="mx-4 md:mx-14 my-8 md:my-4 self-stretch">
                    <div className="h-px w-full md:w-px md:h-full bg-(--gray-7)"></div>
                </div>
                <form onSubmit={handleSubmit(onJoinSubmit)}>
                    <p className="mb-2">Join an existing lobby.</p>
                    <div className="mb-4">
                        <FormLabel>Lobby ID</FormLabel>
                        <TextField.Root
                            {...register("lobbyId")}
                            autoComplete="off"
                            placeholder="ABCD"
                        />
                        <FormError className="mt-1">{errors.lobbyId?.message}</FormError>
                    </div>
                    <Button disabled={isSubmitting} type="submit">
                        {isSubmitting ? <Spinner /> : <span>Join Lobby</span>}
                    </Button>
                </form>
            </div>
        </div>
    );
}
