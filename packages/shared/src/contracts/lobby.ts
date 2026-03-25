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
