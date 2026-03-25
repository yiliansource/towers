import {
    Controller,
    Get,
    MethodNotAllowedException,
    NotFoundException,
    NotImplementedException,
    Param,
    Post,
    UnauthorizedException,
} from "@nestjs/common";

import { LobbyView } from "@towers/shared";

import { AuthenticatedUser } from "@/auth/authenticated-user.decorator";
import type { User } from "@/generated/prisma/client";
import { UserService } from "@/user/user.service";

import { LobbyMapper } from "./lobby.mapper";
import { LobbyService } from "./lobby.service";

@Controller("lobby")
export class LobbyController {
    constructor(
        private readonly lobbyService: LobbyService,
        private readonly lobbyMapper: LobbyMapper,
        private readonly userService: UserService,
    ) {}

    @Get(":id")
    async getLobby(@Param("id") lobbyId: string, @AuthenticatedUser() user: User): Promise<LobbyView | null> {
        const lobby = await this.lobbyService.resolveLobbyFromId(lobbyId, user.id);
        if (!lobby) throw new NotFoundException();
        if (!lobby.users.some((p) => p.id === user.id)) throw new MethodNotAllowedException();

        return this.lobbyMapper.toView(lobby);
    }

    @Post("create")
    async createLobby(@AuthenticatedUser() user: User): Promise<LobbyView> {
        const lobby = await this.lobbyService.createLobby(user.id);
        return await this.lobbyMapper.toView(lobby);
    }

    @Post(":id/join")
    async joinLobby(@Param("id") lobbyId: string, @AuthenticatedUser() user: User): Promise<LobbyView | null> {
        const lobby = await this.lobbyService.resolveLobbyFromId(lobbyId, user.id);
        if (!lobby) throw new NotFoundException();

        await this.lobbyService.joinLobby(lobby.id, user.id);

        return await this.lobbyMapper.toView(lobby);
    }

    @Post(":id/leave")
    async leaveLobby(@Param("id") lobbyId: string, @AuthenticatedUser() user: User) {
        const lobby = await this.lobbyService.resolveLobbyFromId(lobbyId, user.id);
        if (!lobby) throw new NotFoundException();
        if (!lobby.users.some((p) => p.id === user.id)) throw new MethodNotAllowedException();

        await this.lobbyService.removeUser(lobby.id, user.id);
    }

    @Post(":id/kick/:user")
    async kickUserFromLobby(
        @Param("id") lobbyId: string,
        @Param("user") targetUserId: string,
        @AuthenticatedUser() user: User,
    ) {
        const lobby = await this.lobbyService.resolveLobbyFromId(lobbyId, user.id);
        if (!lobby) throw new NotFoundException();
        if (lobby.hostUserId !== user.id) throw new MethodNotAllowedException();

        await this.lobbyService.removeUser(lobby.id, targetUserId, true);
    }

    @Post(":id/start")
    async startGame(@Param("id") lobbyId: string, @AuthenticatedUser() user: User) {
        const lobby = await this.lobbyService.resolveLobbyFromId(lobbyId, user.id);
        if (!lobby) throw new NotFoundException();
        if (lobby.hostUserId !== user.id) throw new UnauthorizedException();

        throw new NotImplementedException();
    }
}
