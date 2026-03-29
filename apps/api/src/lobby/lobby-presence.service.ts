import { Injectable, Logger } from "@nestjs/common";

import { AuthSocket } from "@/auth/socket-auth.service";
import { UserService } from "@/user/user.service";

type LobbyPresenceEntry = {
    socketId: string;
    userId: string;
    lobbyId: string;
    connectedAt: Date;
};

@Injectable()
export class LobbyPresenceService {
    constructor(private readonly userService: UserService) {}

    private readonly logger = new Logger(LobbyPresenceService.name);

    private readonly bySocketId = new Map<string, LobbyPresenceEntry>();
    private readonly socketIdByUserId = new Map<string, string>();

    async bindClientToLobby(client: AuthSocket, lobbyId: string): Promise<void> {
        const userId = client.data.user.id;

        await this.unbindClient(client);

        const entry: LobbyPresenceEntry = {
            socketId: client.id,
            userId,
            lobbyId,
            connectedAt: new Date(),
        };

        this.bySocketId.set(client.id, entry);
        this.socketIdByUserId.set(userId, client.id);

        await this.userService.registerSocket(userId, client.id);

        await client.join(lobbyId);
    }

    async unbindClient(client: AuthSocket): Promise<void> {
        const socketId = client.id;
        const entry = this.bySocketId.get(socketId);

        if (!entry) return;

        this.bySocketId.delete(socketId);
        this.socketIdByUserId.delete(entry.userId);

        await this.userService.clearSocket(entry.userId);

        await client.leave(entry.lobbyId);
    }

    getLobbyIdForSocket(socketId: string): string | null {
        return this.bySocketId.get(socketId)?.lobbyId ?? null;
    }

    getPresenceForSocket(socketId: string): LobbyPresenceEntry | null {
        return this.bySocketId.get(socketId) ?? null;
    }

    isUserPresentInLobby(userId: string, lobbyId: string): boolean {
        const socketId = this.socketIdByUserId.get(userId);
        if (!socketId) return false;

        const entry = this.bySocketId.get(socketId);
        if (entry?.lobbyId === lobbyId) {
            return true;
        }

        return false;
    }
}
