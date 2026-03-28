import { Logger, OnModuleDestroy } from "@nestjs/common";
import { OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Subscription } from "rxjs";
import { Server, Socket } from "socket.io";

import { LobbyClientToServerEvents, LobbyServerToClientEvents } from "@towers/shared/contracts/lobby";

import { AuthenticatedGateway } from "@/auth/authenticated-gateway";
import type { AuthSocket } from "@/auth/socket-auth.service";
import { SocketAuthService } from "@/auth/socket-auth.service";

import { LobbyPresenceService } from "./lobby-presence.service";
import { LobbyMapper } from "./lobby.mapper";
import { LobbyNotification, LobbyNotifier } from "./lobby.notifier";
import { LobbyService } from "./lobby.service";

@WebSocketGateway({
    namespace: "/lobby",
    cors: { origin: true, credentials: true },
})
export class LobbyGateway extends AuthenticatedGateway implements OnGatewayInit, OnModuleDestroy {
    private readonly logger = new Logger(LobbyGateway.name);
    private subscription?: Subscription;

    @WebSocketServer()
    server!: Server<LobbyClientToServerEvents, LobbyServerToClientEvents>;

    constructor(
        private readonly lobbyService: LobbyService,
        private readonly lobbyMapper: LobbyMapper,
        private readonly lobbyNotifier: LobbyNotifier,
        private readonly lobbyPresenceService: LobbyPresenceService,
        socketAuthService: SocketAuthService,
    ) {
        super(socketAuthService);
    }

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
            this.server.to(event.lobbyId).emit("lobby.updated", view);
        } else if (event.type === "lobby.started") {
            const lobby = await this.lobbyService.getLobbyById(event.lobbyId);
            if (!lobby) return;

            this.server.to(event.lobbyId).emit("lobby.game_started");
        }
    }

    protected async onAuthenticatedConnection(client: AuthSocket): Promise<void> {
        const lobby = await this.lobbyService.getLobbyByUser(client.data.user.id);
        if (!lobby) {
            client.disconnect();
            return;
        }

        await this.lobbyPresenceService.bindClientToLobby(client, lobby.id);
        this.lobbyNotifier.emitLobbyUpdate(lobby.id);
    }

    override async handleDisconnect(client: Socket): Promise<void> {
        const lobbyId = this.lobbyPresenceService.getLobbyIdForSocket(client.id);
        await this.lobbyPresenceService.unbindClient(client);

        if (lobbyId) {
            this.lobbyNotifier.emitLobbyUpdate(lobbyId);
        }
    }

    protected async afterDisconnect(client: AuthSocket): Promise<void> {
        await this.lobbyPresenceService.unbindClient(client);
    }
}
