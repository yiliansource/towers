import z from "zod";

export const JoinLobbySchema = z.object({
    lobbyId: z
        .string()
        .length(4, "Lobby ID must be 4 characters long.")
        .regex(/[A-Z]/, "Lobby ID must only consist of A-Z."),
});

export type JoinLobbyInput = z.infer<typeof JoinLobbySchema>;
