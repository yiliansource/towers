import z from "zod";

import { UserView } from "./auth.js";

export const LobbyState = {
    WAITING: "WAITING",
    INGAME: "INGAME",
    FINISHED: "FINISHED",
} as const;
export type LobbyState = (typeof LobbyState)[keyof typeof LobbyState];

export interface LobbyView {
    id: string;
    publicId: string;
    users: UserView[];
    hostUserId: string;
    state: LobbyState;
}

export const JoinLobbySchema = z.object({
    lobbyId: z
        .string()
        .length(4, "Lobby ID must be 4 characters long.")
        .regex(/[A-Z]/, "Lobby ID must only consist of A-Z."),
});

export type JoinLobbyInput = z.infer<typeof JoinLobbySchema>;
