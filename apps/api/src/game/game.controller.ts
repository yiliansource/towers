import type { GameSnapshot } from "@towers/shared/contracts";

import { AuthenticatedUser } from "@/auth/authenticated-user.decorator";
import type { User } from "@/generated/prisma/client";
import { LobbyService } from "@/lobby/lobby.service";

import { Controller, Get, NotFoundException } from "@nestjs/common";

import { GameService } from "./game.service";

@Controller("game")
export class GameController {
    constructor(
        private readonly lobbyService: LobbyService,
        private readonly gameService: GameService,
    ) {}

    @Get()
    async getGame(@AuthenticatedUser() user: User): Promise<GameSnapshot> {
        const lobby = await this.lobbyService.getLobbyByUser(user.id);
        if (!lobby) throw new NotFoundException();

        const snapshot = await this.gameService.getGameSnapshot(lobby.id);
        if (!snapshot) throw new NotFoundException();

        return snapshot;
    }
}
