import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";

import { GameState, GameStateSchema } from "@towers/shared/contracts/game";

import { LobbyService } from "@/lobby/lobby.service";
import { PrismaService } from "@/prisma/prisma.service";

import { GameNotifier } from "./game.notifier";

@Injectable()
export class GameService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly lobbyService: LobbyService,
        private readonly gameNotifier: GameNotifier,
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
        if (lobby.state !== "INGAME" || !lobby.state) throw new InternalServerErrorException();

        return GameStateSchema.parse(lobby.game);
    }

    async finishGame(lobbyId: string) {
        await this.lobbyService.finishGame(lobbyId);

        this.gameNotifier.notify({ type: "game.finished", lobbyId });
    }
}
