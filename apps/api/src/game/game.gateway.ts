import { Logger, OnModuleDestroy } from "@nestjs/common";
import { MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Subscription } from "rxjs";
import { Server } from "socket.io";

import type {
    GameClientToServerEvents,
    GamePerformActionPayload,
    GameServerToClientEvents,
} from "@towers/shared/contracts/game";
import { LobbyError } from "@towers/shared/contracts/lobby";

import { AuthenticatedGateway } from "@/auth/authenticated-gateway";
import { AuthenticatedSocketUser } from "@/auth/authenticated-user.decorator";
import type { AuthSocket } from "@/auth/socket-auth.service";
import { SocketAuthService } from "@/auth/socket-auth.service";
import type { User } from "@/generated/prisma/client";
import { LobbyPresenceService } from "@/lobby/lobby-presence.service";
import { LobbyMapper } from "@/lobby/lobby.mapper";
import { LobbyNotification, LobbyNotifier } from "@/lobby/lobby.notifier";
import { LobbyService } from "@/lobby/lobby.service";

import { GameNotification, GameNotifier } from "./game.notifier";
import { GameService } from "./game.service";

@WebSocketGateway({
    namespace: "/game",
    cors: { origin: true, credentials: true },
})
export class GameGateway extends AuthenticatedGateway implements OnGatewayInit, OnModuleDestroy {
    private readonly logger = new Logger(GameGateway.name);
    private gameNotifierSub?: Subscription;
    private lobbyNotifierSub?: Subscription;

    @WebSocketServer()
    server!: Server<GameClientToServerEvents, GameServerToClientEvents>;

    constructor(
        private readonly lobbyMapper: LobbyMapper,
        private readonly lobbyService: LobbyService,
        private readonly lobbyNotifier: LobbyNotifier,
        private readonly lobbyPresenceService: LobbyPresenceService,
        private readonly gameService: GameService,
        private readonly gameNotifier: GameNotifier,
        socketAuthService: SocketAuthService,
    ) {
        super(socketAuthService);
    }

    afterInit(): void {
        this.gameNotifierSub = this.gameNotifier.asObservable().subscribe({
            next: (event) => {
                void this.handleGameNotification(event).catch((error: unknown) => {
                    this.logger.error(error);
                });
            },
        });
        this.lobbyNotifierSub = this.lobbyNotifier.asObservable().subscribe({
            next: (event) => {
                void this.handleLobbyNotification(event).catch((error: unknown) => {
                    this.logger.error(error);
                });
            },
        });
    }
    onModuleDestroy(): void {
        this.gameNotifierSub?.unsubscribe();
    }

    private async handleGameNotification(event: GameNotification): Promise<void> {
        if (event.type === "game.updated") {
            const game = await this.gameService.getGameByLobby(event.lobbyId);
            if (!game) return;

            this.server.to(event.lobbyId).emit("game.updated", game);
        } else if (event.type === "game.finished") {
            const lobby = await this.lobbyService.getLobbyById(event.lobbyId);
            if (!lobby) return;

            this.server.to(event.lobbyId).emit("game.finished");
        }
    }
    private async handleLobbyNotification(event: LobbyNotification): Promise<void> {
        if (event.type === "lobby.updated") {
            const lobby = await this.lobbyService.getLobbyById(event.lobbyId);
            if (!lobby) return;

            const view = await this.lobbyMapper.toView(lobby);
            this.server.to(event.lobbyId).emit("lobby.updated", view);
        } else if (event.type === "lobby.game_started") {
            await this.gameService.initializeGame(event.lobbyId);
        }
    }

    override async onAuthenticatedConnect(client: AuthSocket): Promise<void> {
        const lobby = await this.lobbyService.getLobbyByUser(client.data.user.id);
        if (!lobby) {
            client.disconnect();
            return;
        }

        await this.lobbyPresenceService.bindClientToLobby(client, lobby.id);
        this.gameNotifier.emitGameUpdate(lobby.id);
        this.lobbyNotifier.emitLobbyUpdate(lobby.id);
    }
    override async onAuthenticatedDisconnect(client: AuthSocket): Promise<void> {
        const lobbyId = this.lobbyPresenceService.getLobbyIdForSocket(client.id);
        await this.lobbyPresenceService.unbindClient(client);

        if (lobbyId) {
            this.lobbyNotifier.emitLobbyUpdate(lobbyId);
            this.gameNotifier.emitGameUpdate(lobbyId);
        }
    }

    @SubscribeMessage<keyof GameClientToServerEvents>("game.perform_action")
    async handleLobbyLeave(@AuthenticatedSocketUser() user: User, @MessageBody() payload: GamePerformActionPayload) {
        const lobby = await this.lobbyService.getLobbyByUser(user.id);
        if (!lobby) throw new LobbyError("USER_NOT_IN_LOBBY");

        await this.gameService.performAction(lobby.id, user.id, payload);

        return { ok: true };
    }
}
