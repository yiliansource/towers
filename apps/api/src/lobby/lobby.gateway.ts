import { Inject, Logger, NotFoundException, UnauthorizedException, forwardRef } from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";

import { ClientToServerEvents, ServerToClientEvents } from "@towers/shared/contracts/common";

import type { AuthSocket } from "@/auth/socket-auth.service";
import { SocketAuthService } from "@/auth/socket-auth.service";
import { UserService } from "@/user/user.service";

import { LobbyMapper } from "./lobby.mapper";
import { LobbyService } from "./lobby.service";

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true,
    },
})
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(LobbyGateway.name);

    @WebSocketServer()
    server!: Server<ClientToServerEvents, ServerToClientEvents>;

    constructor(
        @Inject(forwardRef(() => LobbyService))
        private readonly lobbyService: LobbyService,
        private readonly lobbyMapper: LobbyMapper,
        private readonly userService: UserService,
        private readonly socketAuthService: SocketAuthService,
    ) {}

    async handleConnection(socket: AuthSocket) {
        try {
            await this.socketAuthService.authenticate(socket);

            const lobbyId = await this.lobbyService.getLobbyIdFromUser(socket.data.user.id);
            if (lobbyId) {
                void this.emitLobbyState(lobbyId);
            }
        } catch (e) {
            console.error(e);
            socket.disconnect();
        }
    }

    async handleDisconnect(socket: AuthSocket) {
        await this.socketAuthService.disconnect(socket);

        const lobbyId = await this.lobbyService.getLobbyIdFromUser(socket.data.user.id);
        if (lobbyId) {
            void this.emitLobbyState(lobbyId);
        }
    }

    @SubscribeMessage("lobby:subscribe")
    async handleSubscribe(@MessageBody() { lobbyId }: { lobbyId: string }, @ConnectedSocket() socket: AuthSocket) {
        const userId = socket.data.user.id;
        const lobby = await this.lobbyService.resolveLobbyFromId(lobbyId, userId);
        if (!lobby) throw new NotFoundException();

        const isMember = await this.lobbyService.isPlayerInLobby(lobby.id, userId);
        if (!isMember) throw new UnauthorizedException();

        await socket.join(lobby.id);
        void this.emitLobbyState(lobby.id); // TODO: is this okay?

        return { ok: true };
    }

    @SubscribeMessage("lobby:unsubscribe")
    async handleUnsubscribe(@MessageBody() { lobbyId }: { lobbyId: string }, @ConnectedSocket() socket: AuthSocket) {
        const userId = socket.data.user.id;
        const lobby = await this.lobbyService.resolveLobbyFromId(lobbyId, userId);
        if (!lobby) throw new NotFoundException();

        const isMember = await this.lobbyService.isPlayerInLobby(lobby.id, userId);
        if (!isMember) throw new UnauthorizedException();

        await socket.leave(lobby.id);
        return { ok: true };
    }

    async emitLobbyState(lobbyId: string) {
        const lobby = await this.lobbyService.lobby({ id: lobbyId });
        if (!lobby) throw new NotFoundException();

        const view = await this.lobbyMapper.toView(lobby);

        this.server.to(lobbyId).emit("lobby:state", view);
    }
}
