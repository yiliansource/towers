import { Controller, Get, NotFoundException, Param, Post, UseFilters } from "@nestjs/common";

import { LobbyView } from "@towers/shared/contracts";

import { AuthenticatedUser } from "@/auth/authenticated-user.decorator";
import type { User } from "@/generated/prisma/client";
import { UserService } from "@/user/user.service";

import { LobbyHttpExceptionFilter } from "./errors/lobby-http-exception.filter";
import { LobbyMapper } from "./lobby.mapper";
import { LobbyService } from "./lobby.service";

@Controller("lobby")
@UseFilters(LobbyHttpExceptionFilter)
export class LobbyController {
    constructor(
        private readonly lobbyService: LobbyService,
        private readonly lobbyMapper: LobbyMapper,
        private readonly userService: UserService,
    ) {}

    @Get()
    async getLobby(@AuthenticatedUser() user: User): Promise<LobbyView> {
        const lobby = await this.lobbyService.getLobbyByUser(user.id);
        if (!lobby) throw new NotFoundException();

        return this.lobbyMapper.toView(lobby);
    }

    @Post("create")
    async createLobby(@AuthenticatedUser() user: User): Promise<LobbyView> {
        const lobby = await this.lobbyService.createLobby(user.id);
        return await this.lobbyMapper.toView(lobby);
    }

    @Post("join/:publicId")
    async joinLobby(
        @Param("publicId") publicLobbyId: string,
        @AuthenticatedUser() user: User,
    ): Promise<LobbyView | null> {
        const lobby = await this.lobbyService.joinLobby(user.id, publicLobbyId);
        return await this.lobbyMapper.toView(lobby);
    }

    // @Post("leave")
    // async leaveLobby(@AuthenticatedUser() user: User) {
    //     const lobby = await this.lobbyService.getLobbyByUser(user.id);
    //     if (!lobby) throw new LobbyError("USER_NOT_IN_LOBBY");

    //     await this.lobbyService.leaveLobby(user.id);
    // }

    // @Post("kick/:userId")
    // async kickUserFromLobby(@Param("userId") targetUserId: string, @AuthenticatedUser() user: User) {
    //     const lobby = await this.lobbyService.getLobbyByUser(user.id);
    //     if (!lobby) throw new NotFoundException();
    //     if (lobby.hostId !== user.id) throw new MethodNotAllowedException();

    //     await this.lobbyService.kickPlayer(lobby.id, targetUserId);
    // }

    // @Post("finish")
    // async finishGame(@AuthenticatedUser() user: User) {
    //     const lobby = await this.lobbyService.getLobbyByUser(user.id);
    //     if (!lobby) throw new NotFoundException();
    //     if (lobby.hostId !== user.id) throw new UnauthorizedException();

    //     await this.lobbyService.finishGame(lobby.id);
    // }
}
