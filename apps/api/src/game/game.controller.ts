import { Controller, Get, NotFoundException } from "@nestjs/common";

import { GameState } from "@towers/shared/contracts";

import { AuthenticatedUser } from "@/auth/authenticated-user.decorator";
import type { User } from "@/generated/prisma/client";

import { GameService } from "./game.service";

@Controller("game")
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get()
    async getGame(@AuthenticatedUser() user: User): Promise<GameState> {
        const game = await this.gameService.getGameByUser(user.id);
        if (!game) throw new NotFoundException();

        return game;
    }
}
