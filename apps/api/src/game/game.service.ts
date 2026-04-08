import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InputJsonValue } from "@prisma/client/runtime/client";
import { produce } from "immer";

import { GameState, GameStateSchema } from "@towers/shared/contracts/game";
import { LobbyError } from "@towers/shared/contracts/lobby";
import { AXIAL_ZERO, axial, axialDirection, axialRotateAroundCenter, scaleAxial } from "@towers/shared/hexgrid";

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

    async getGameByLobby(lobbyId: string): Promise<GameState> {
        const lobby = await this.lobbyService.getLobbyById(lobbyId);
        if (!lobby) throw new NotFoundException();
        if (lobby.state !== "INGAME") throw new BadRequestException();

        return GameStateSchema.parse(lobby.game);
    }
    async getGameByUser(userId: string): Promise<GameState> {
        const lobby = await this.lobbyService.getLobbyByUser(userId);
        if (!lobby) throw new NotFoundException();
        if (lobby.state !== "INGAME" || !lobby.state) throw new InternalServerErrorException();

        return GameStateSchema.parse(lobby.game);
    }

    async initializeGame(lobbyId: string) {
        const lobby = await this.lobbyService.getLobbyById(lobbyId);
        if (!lobby) throw new LobbyError("LOBBY_NOT_FOUND");
        if (lobby.game) throw new Error("Game already initialized");

        const occupiedSeats = lobby.seats.filter((s) => !!s.userId);
        const playOrder = occupiedSeats.map((s) => s.userId!);

        await this.updateGameState(lobbyId, {
            ctx: {
                turn: 0,
                phase: "SETUP",
                playOrder,
                playOrderPos: 0,
                currentPlayerId: playOrder[0],
                totalPlayers: occupiedSeats.length,
            },
            towers: [axial(0, 0), ...axialRotateAroundCenter(scaleAxial(axialDirection(0), 3), AXIAL_ZERO)],
            units: Object.fromEntries(playOrder.map((p) => [p, []])),
            players: lobby.seats
                .filter((s) => !!s.userId)
                .map((s) => ({
                    id: s.user!.id,
                    points: 0,
                    username: s.user!.username,
                })),
        });
    }

    async endPlayerTurn(lobbyId: string) {
        const game = await this.getGameByLobby(lobbyId);
        await this.updateGameState(
            lobbyId,
            produce(game, (draft) => {
                // advance to the next player
                draft.ctx.playOrderPos++;
                if (draft.ctx.playOrderPos >= draft.ctx.totalPlayers) {
                    draft.ctx.turn++;
                    draft.ctx.playOrderPos = 0;
                }
                draft.ctx.currentPlayerId = draft.ctx.playOrder[draft.ctx.playOrderPos];
            }),
        );
    }

    async updateGameState(lobbyId: string, game: GameState | null): Promise<void> {
        await this.prisma.lobby.update({
            where: { id: lobbyId },
            data: { game: game as InputJsonValue },
        });

        this.gameNotifier.emitGameUpdate(lobbyId);
    }

    async finishGame(lobbyId: string) {
        await this.prisma.lobby.update({
            where: { id: lobbyId },
            data: { game: undefined, state: "WAITING" },
        });

        this.gameNotifier.notify({ type: "game.finished", lobbyId });
    }
}
