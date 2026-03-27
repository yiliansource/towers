import { Inject, Logger, NotFoundException, OnModuleDestroy, forwardRef } from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Subscription } from "rxjs";
import { Server } from "socket.io";

import { ClientToServerEvents, ServerToClientEvents } from "@towers/shared/contracts/common";

import type { AuthSocket } from "@/auth/socket-auth.service";
import { SocketAuthService } from "@/auth/socket-auth.service";

import { LobbyMapper } from "./lobby.mapper";
import { LobbyNotification, LobbyNotifier } from "./lobby.notifier";
import { LobbyService } from "./lobby.service";

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true,
    },
})
export class LobbyGateway implements OnGatewayInit, OnModuleDestroy, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(LobbyGateway.name);
    private subscription?: Subscription;

    @WebSocketServer()
    server!: Server<ClientToServerEvents, ServerToClientEvents>;

    constructor(
        @Inject(forwardRef(() => LobbyService))
        private readonly lobbyService: LobbyService,
        private readonly lobbyMapper: LobbyMapper,
        private readonly lobbyNotifier: LobbyNotifier,
        private readonly socketAuthService: SocketAuthService,
    ) {}

    afterInit(): void {
        this.subscription = this.lobbyNotifier.asObservable().subscribe({
            next: (event) => {
                void this.handleLobbyNotification(event).catch((error: unknown) => {
                    this.logger.error(error);
                });
            },
        });
    }

    onModuleDestroy(): void {
        this.subscription?.unsubscribe();
    }

    private async handleLobbyNotification(event: LobbyNotification): Promise<void> {
        if (event.type === "lobby.updated") {
            const lobby = await this.lobbyService.getLobbyById(event.lobbyId);
            if (!lobby) return;

            const view = await this.lobbyMapper.toView(lobby);
            this.server.to(event.lobbyId).emit("lobby:state", view);
            return;
        }
    }

    async handleConnection(socket: AuthSocket) {
        try {
            await this.socketAuthService.authenticate(socket);
        } catch (e) {
            this.logger.error(e);
            socket.disconnect();
        }
    }

    async handleDisconnect(socket: AuthSocket) {
        await this.socketAuthService.disconnect(socket);
    }

    @SubscribeMessage("lobby:subscribe")
    async handleSubscribe(
        @MessageBody() { publicLobbyId }: { publicLobbyId: string },
        @ConnectedSocket() socket: AuthSocket,
    ) {
        const lobby = await this.lobbyService.getLobbyByPublicId(publicLobbyId);
        if (!lobby) throw new NotFoundException();

        await socket.join(lobby.id);
        this.lobbyNotifier.notify({ type: "lobby.updated", lobbyId: lobby.id });

        return { ok: true };
    }

    @SubscribeMessage("lobby:unsubscribe")
    async handleUnsubscribe(
        @MessageBody() { publicLobbyId }: { publicLobbyId: string },
        @ConnectedSocket() socket: AuthSocket,
    ) {
        const lobby = await this.lobbyService.getLobbyByPublicId(publicLobbyId);
        if (!lobby) throw new NotFoundException();

        await socket.leave(lobby.id);
        this.lobbyNotifier.notify({ type: "lobby.updated", lobbyId: lobby.id });

        return { ok: true };
    }
}
