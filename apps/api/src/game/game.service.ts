import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import {
    GameError,
    type GamePerformActionPayload,
    type GameState,
    GameStateSchema,
    LobbyError,
} from "@towers/shared/contracts";
import {
    AXIAL_ZERO,
    addStackedAxial,
    axialDirection,
    axialRotateAroundCenter,
    axialToStacked,
    equalStackedAxial,
    STACKED_AXIAL_DOWN,
    STACKED_AXIAL_UP,
    STACKED_AXIAL_ZERO,
    type StackedAxial,
    scaleAxial,
} from "@towers/shared/hexgrid";
import { produce } from "immer";

import { type Lobby, Prisma } from "@/generated/prisma/client";
import { LobbyService } from "@/lobby/lobby.service";
import { PrismaService } from "@/prisma/prisma.service";

import { GameNotifier } from "./game.notifier";

@Injectable()
export class GameService {
    private readonly logger = new Logger(GameService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly lobbyService: LobbyService,
        private readonly gameNotifier: GameNotifier,
    ) {}

    async getGameByLobby(lobbyId: string): Promise<GameState> {
        const lobby = await this.lobbyService.getLobbyById(lobbyId);
        return this.ensureGameState(lobby);
    }
    async getGameByUser(userId: string): Promise<GameState> {
        const lobby = await this.lobbyService.getLobbyByUser(userId);
        return this.ensureGameState(lobby);
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
            towers: [
                STACKED_AXIAL_ZERO,
                ...axialRotateAroundCenter(scaleAxial(axialDirection(0), 3), AXIAL_ZERO).map((a) =>
                    axialToStacked(a, 0),
                ),
            ],
            units: Object.fromEntries(playOrder.map((p) => [p, []])),
            king: addStackedAxial(STACKED_AXIAL_ZERO, STACKED_AXIAL_UP),
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
                    if (draft.ctx.phase === "SETUP") {
                        draft.ctx.playOrderPos = 0;
                        draft.ctx.phase = "PLAYING";
                    } else {
                        draft.ctx.turn++;
                        draft.ctx.playOrderPos = 0;
                    }
                }
                draft.ctx.currentPlayerId = draft.ctx.playOrder[draft.ctx.playOrderPos];
            }),
        );
    }

    async placeKnight(lobbyId: string, playerId: string, coord: StackedAxial) {
        const game = await this.getGameByLobby(lobbyId);

        if (game.ctx.phase === "SETUP") {
            const coordBelow = addStackedAxial(coord, STACKED_AXIAL_DOWN);
            if (!game.towers.some((t) => equalStackedAxial(t, coordBelow))) return;
            if (equalStackedAxial(game.king, coord)) return;
            if (
                Object.values(game.units).some((coords) =>
                    coords.some((c) => equalStackedAxial(c, coord)),
                )
            )
                return;

            await this.updateGameState(
                lobbyId,
                produce(game, (draft) => {
                    draft.units[playerId].push(coord);
                }),
            );

            await this.endPlayerTurn(lobbyId);
        }
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
            data: { game: Prisma.DbNull, state: "WAITING" },
        });

        this.gameNotifier.notify({ type: "game.finished", lobbyId });
    }

    async performAction(lobbyId: string, playerId: string, payload: GamePerformActionPayload) {
        const game = await this.getGameByLobby(lobbyId);

        if (payload.type === "abortGame") {
            await this.finishGame(lobbyId);
            return;
        }

        if (game.ctx.phase === "SETUP") {
            if (payload.type === "none") {
                return;
            } else if (payload.type === "placeKnight") {
                await this.placeKnight(lobbyId, playerId, payload.coord);
                return;
            }
        } else if (game.ctx.phase === "PLAYING") {
            if (payload.type === "none") {
                return;
            } else if (payload.type === "endTurn") {
                await this.endPlayerTurn(lobbyId);
                return;
            }
        }

        this.logger.warn(`Unhandled action ${payload.type} in phase ${game.ctx.phase}.`);
    }

    private async ensureGameState(lobby: Lobby | null): Promise<GameState> {
        if (!lobby) throw new NotFoundException();
        if (lobby.state !== "INGAME") throw new InternalServerErrorException();

        const result = GameStateSchema.safeParse(lobby.game);
        if (!result.success) {
            this.logger.error(
                `Invalid lobby state was detected in lobby ${lobby.id} and could not be recovered. ` +
                    `The game will exit.`,
                result.error,
            );

            await this.prisma.lobby.update({
                where: { id: lobby.id },
                data: {
                    state: "WAITING",
                    game: Prisma.DbNull,
                },
            });

            throw new GameError("INVALID_GAME_STATE");
        }

        return result.data;
    }
}
