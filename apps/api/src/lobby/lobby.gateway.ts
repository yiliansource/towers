import {
    type LobbyClientToServerEvents,
    LobbyError,
    type LobbyServerToClientEvents,
    type SlotColor,
} from "@towers/shared/contracts";

import { AuthenticatedGateway } from "@/auth/authenticated-gateway";
import { AuthenticatedSocketUser } from "@/auth/authenticated-user.decorator";
import { AuthSocket, SocketAuthService } from "@/auth/socket-auth.service";
import type { User } from "@/generated/prisma/client";
import { UserService } from "@/user/user.service";

import {
    Logger,
    NotFoundException,
    type OnModuleDestroy,
    UnauthorizedException,
    UseFilters,
} from "@nestjs/common";
import {
    MessageBody,
    type OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import type { Subscription } from "rxjs";
import type { Server } from "socket.io";

import { LobbyWsExceptionFilter } from "./errors/lobby-ws-exception.filter";
import { LobbyMapper } from "./lobby.mapper";
import { LobbyNotification, LobbyNotifier } from "./lobby.notifier";
import { LobbyService } from "./lobby.service";
import { LobbyPresenceService } from "./lobby-presence.service";

@WebSocketGateway({
    namespace: "/lobby",
    cors: { origin: true, credentials: true },
})
@UseFilters(LobbyWsExceptionFilter)
export class LobbyGateway extends AuthenticatedGateway implements OnGatewayInit, OnModuleDestroy {
    private readonly logger = new Logger(LobbyGateway.name);
    private subscription?: Subscription;

    @WebSocketServer()
    server!: Server<LobbyClientToServerEvents, LobbyServerToClientEvents>;

    constructor(
        private readonly userService: UserService,
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
        } else if (event.type === "lobby.game_started") {
            const lobby = await this.lobbyService.getLobbyById(event.lobbyId);
            if (!lobby) return;

            this.server.to(event.lobbyId).emit("lobby.game_started");
        }
    }

    override async onAuthenticatedConnect(client: AuthSocket): Promise<void> {
        const lobby = await this.lobbyService.getLobbyByUser(client.data.user.id);
        if (!lobby) {
            client.disconnect();
            return;
        }

        await this.lobbyPresenceService.bindClientToLobby(client, lobby.id);
        this.lobbyNotifier.emitLobbyUpdate(lobby.id);
    }
    override async onAuthenticatedDisconnect(client: AuthSocket): Promise<void> {
        const lobbyId = this.lobbyPresenceService.getLobbyIdForSocket(client.id);
        await this.lobbyPresenceService.unbindClient(client);

        if (lobbyId) {
            this.lobbyNotifier.emitLobbyUpdate(lobbyId);
        }
    }

    @SubscribeMessage<keyof LobbyClientToServerEvents>("lobby.leave")
    async handleLobbyLeave(@AuthenticatedSocketUser() user: User) {
        const lobby = await this.lobbyService.getLobbyByUser(user.id);
        if (!lobby) throw new LobbyError("USER_NOT_IN_LOBBY");

        await this.lobbyService.leaveLobby(user.id);

        return { ok: true };
    }

    @SubscribeMessage<keyof LobbyClientToServerEvents>("lobby.switch_slot")
    async handleLobbySwitchSlot(
        @MessageBody("slot") slot: number,
        @AuthenticatedSocketUser() user: User,
    ) {
        const lobby = await this.lobbyService.getLobbyByUser(user.id);
        if (!lobby) throw new NotFoundException();

        await this.lobbyService.changeSlot(lobby.id, user.id, slot);

        return { ok: true };
    }

    @SubscribeMessage<keyof LobbyClientToServerEvents>("lobby.choose_color")
    async handleLobbyChooseColor(
        @MessageBody("color") color: SlotColor,
        @AuthenticatedSocketUser() user: User,
    ) {
        const lobby = await this.lobbyService.getLobbyByUser(user.id);
        if (!lobby) throw new NotFoundException();

        await this.lobbyService.chooseColor(lobby.id, user.id, color);

        return { ok: true };
    }

    @SubscribeMessage<keyof LobbyClientToServerEvents>("lobby.kick_slot")
    async handleLobbyKickSlot(
        @MessageBody("slot") slot: number,
        @AuthenticatedSocketUser() user: User,
    ) {
        const lobby = await this.lobbyService.getLobbyByUser(user.id);
        if (!lobby) throw new NotFoundException();

        // TODO: this is awkward
        await this.lobbyService.kickSlot(lobby.id, user.id, slot);
        const socketId = await this.userService.getSocketId(lobby.seats[slot].userId!);
        this.server.to(socketId!).emit("lobby.removed");

        return { ok: true };
    }

    @SubscribeMessage<keyof LobbyClientToServerEvents>("lobby.promote_slot")
    async handleLobbyPromoteSlot(
        @MessageBody("slot") slot: number,
        @AuthenticatedSocketUser() user: User,
    ) {
        const lobby = await this.lobbyService.getLobbyByUser(user.id);
        if (!lobby) throw new NotFoundException();

        await this.lobbyService.promoteSlot(lobby.id, user.id, slot);

        return { ok: true };
    }

    @SubscribeMessage<keyof LobbyClientToServerEvents>("lobby.start_game")
    async handleLobbyStart(@AuthenticatedSocketUser() user: User) {
        const lobby = await this.lobbyService.getLobbyByUser(user.id);
        if (!lobby) throw new NotFoundException();
        if (lobby.hostId !== user.id) throw new UnauthorizedException();

        await this.lobbyService.startGame(lobby.id);

        return { ok: true };
    }
}
