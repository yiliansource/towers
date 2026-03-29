import { Logger, OnModuleDestroy } from "@nestjs/common";
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Subscription } from "rxjs";
import { Server } from "socket.io";

import { GameClientToServerEvents, GameServerToClientEvents } from "@towers/shared/contracts/game";
import { LobbyError } from "@towers/shared/contracts/lobby";

import { AuthenticatedGateway } from "@/auth/authenticated-gateway";
import { AuthenticatedSocketUser } from "@/auth/authenticated-user.decorator";
import type { AuthSocket } from "@/auth/socket-auth.service";
import { SocketAuthService } from "@/auth/socket-auth.service";
import type { User } from "@/generated/prisma/client";
import { LobbyPresenceService } from "@/lobby/lobby-presence.service";
import { LobbyService } from "@/lobby/lobby.service";

import { GameNotification, GameNotifier } from "./game.notifier";
import { GameService } from "./game.service";

@WebSocketGateway({
    namespace: "/game",
    cors: { origin: true, credentials: true },
})
export class GameGateway extends AuthenticatedGateway implements OnGatewayInit, OnModuleDestroy {
    private readonly logger = new Logger(GameGateway.name);
    private subscription?: Subscription;

    @WebSocketServer()
    server!: Server<GameClientToServerEvents, GameServerToClientEvents>;

    constructor(
        private readonly lobbyService: LobbyService,
        private readonly gameService: GameService,
        private readonly lobbyPresenceService: LobbyPresenceService,
        private readonly gameNotifier: GameNotifier,
        socketAuthService: SocketAuthService,
    ) {
        super(socketAuthService);
    }

    afterInit(): void {
        this.subscription = this.gameNotifier.asObservable().subscribe({
            next: (event) => {
                void this.handleGameNotification(event).catch((error: unknown) => {
                    this.logger.error(error);
                });
            },
        });
    }
    onModuleDestroy(): void {
        this.subscription?.unsubscribe();
    }

    private async handleGameNotification(event: GameNotification): Promise<void> {
        if (event.type === "game.updated") {
            const lobby = await this.lobbyService.getLobbyById(event.lobbyId);
            if (!lobby) return;

            // const view = await this.lobbyMapper.toView(lobby);
            // this.server.to(event.lobbyId).emit("game.updated", {});
        } else if (event.type === "game.finished") {
            const lobby = await this.lobbyService.getLobbyById(event.lobbyId);
            if (!lobby) return;

            this.server.to(event.lobbyId).emit("game.finished");
        }
    }

    override async onAuthenticatedConnect(client: AuthSocket): Promise<void> {
        const lobby = await this.lobbyService.getLobbyByUser(client.data.user.id);
        if (!lobby) {
            client.disconnect();
            return;
        }

        await this.lobbyPresenceService.bindClientToLobby(client, lobby.id);
    }
    override async onAuthenticatedDisconnect(client: AuthSocket): Promise<void> {
        // const lobbyId = this.lobbyPresenceService.getLobbyIdForSocket(client.id);
        await this.lobbyPresenceService.unbindClient(client);

        // if (lobbyId) {}
    }

    @SubscribeMessage<keyof GameClientToServerEvents>("game.finish")
    async handleLobbyLeave(@AuthenticatedSocketUser() user: User): Promise<void> {
        const lobby = await this.lobbyService.getLobbyByUser(user.id);
        if (!lobby) throw new LobbyError("USER_NOT_IN_LOBBY");

        await this.gameService.finishGame(lobby.id);
    }
}
