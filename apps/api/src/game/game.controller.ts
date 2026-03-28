import { Controller, Get, NotFoundException } from "@nestjs/common";

import { GameState } from "@towers/shared/contracts/game";

import { AuthenticatedUser } from "@/auth/authenticated-user.decorator";
import type { User } from "@/generated/prisma/client";
import { LobbyService } from "@/lobby/lobby.service";

import { GameService } from "./game.service";

@Controller("game")
export class GameController {
    constructor(
        private readonly gameService: GameService,
        private readonly lobbyService: LobbyService,
    ) {}

    @Get()
    async getGame(@AuthenticatedUser() user: User): Promise<GameState> {
        const game = await this.gameService.getGameByUser(user.id);
        if (!game) throw new NotFoundException();

        return game;
    }
}
