import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { GameState, GameStateSchema } from "@towers/shared/contracts/game";

import { LobbyService } from "@/lobby/lobby.service";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class GameService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly lobbyService: LobbyService,
    ) {}

    async getGameByLobby(lobbyId: string): Promise<GameState | null> {
        const lobby = await this.lobbyService.getLobbyById(lobbyId);
        if (!lobby) throw new NotFoundException();
        if (lobby.state !== "INGAME") throw new BadRequestException();

        return GameStateSchema.parse(lobby.game);
    }
    async getGameByUser(userId: string): Promise<GameState | null> {
        const lobby = await this.lobbyService.getLobbyByUser(userId);
        if (!lobby) throw new NotFoundException();
        if (lobby.state !== "INGAME") throw new BadRequestException();

        return GameStateSchema.parse(lobby.game);
    }
}
