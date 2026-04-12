import {
    GameAction,
    GameActionSubmitPayload,
    GameError,
    GameSnapshot,
    GameState,
    GameStateSchema,
    LobbyError,
    UnitType,
} from "@towers/shared/contracts";
import {
    AXIAL_ZERO,
    addStackedAxial,
    axialDirection,
    axialRotateAroundCenter,
    axialToStacked,
    equalStackedAxial,
    STACKED_AXIAL_UP,
    STACKED_AXIAL_ZERO,
    type StackedAxial,
    scaleAxial,
} from "@towers/shared/hexgrid";

import { type Lobby, Prisma } from "@/generated/prisma/client";
import { LobbyService } from "@/lobby/lobby.service";
import { PrismaService } from "@/prisma/prisma.service";

import { Injectable, Logger, NotFoundException, NotImplementedException } from "@nestjs/common";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import { produce } from "immer";

import { getAllowedPlaceTowerFields } from "./actions/place-tower.action";
import { getAllowedPlaceUnitFields } from "./actions/place-unit.action";
import { GameNotifier } from "./game.notifier";

@Injectable()
export class GameService {
    private readonly logger = new Logger(GameService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly lobbyService: LobbyService,
        private readonly gameNotifier: GameNotifier,
    ) {}

    private async ensureGameState(lobby: Lobby | null): Promise<GameState> {
        if (!lobby) throw new NotFoundException();
        if (lobby.state !== "INGAME") throw new GameError("INVALID_GAME_STATE");

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
            context: {
                phase: "SETUP",
                innerPhaseIndex: -1,
                turn: 0,
                playOrder,
                playOrderPos: 0,
                currentPlayerId: playOrder[0],
                totalPlayers: occupiedSeats.length,
            },
            boardState: {
                king: addStackedAxial(STACKED_AXIAL_ZERO, STACKED_AXIAL_UP),
                towers: [
                    STACKED_AXIAL_ZERO,
                    ...axialRotateAroundCenter(scaleAxial(axialDirection(0), 3), AXIAL_ZERO).map(
                        (a) => axialToStacked(a, 0),
                    ),
                ],
                units: Object.fromEntries(playOrder.map((p) => [p, []])),
                resources: Object.fromEntries(
                    playOrder.map((p) => [
                        p,
                        {
                            score: 0,
                            actionPoints: 0,
                            towers: 0,
                            knights: 0,
                        },
                    ]),
                ),
            },
        });
    }

    async finishGame(lobbyId: string) {
        await this.prisma.lobby.update({
            where: { id: lobbyId },
            data: {
                game: Prisma.DbNull,
                state: "WAITING",
            },
        });

        this.gameNotifier.notify({ type: "game.finished", lobbyId });
    }

    async updateGameState(lobbyId: string, game: GameState | null): Promise<void> {
        await this.prisma.lobby.update({
            where: { id: lobbyId },
            data: {
                game: game ? (game as InputJsonValue) : Prisma.DbNull,
            },
        });

        this.gameNotifier.emitGameUpdate(lobbyId);
    }

    async generateGameActions(lobbyId: string, playerId: string): Promise<GameAction[]> {
        const actions: GameAction[] = [];

        const game = await this.getGameByLobby(lobbyId);

        if (game.context.phase === "SETUP") {
            actions.push({
                name: "placeUnit",
                steps: ["selectHex", "confirm"],
                forced: true,
                cost: {
                    type: "fixed",
                    amount: 0,
                },
                availableCoords: getAllowedPlaceUnitFields(game, playerId),
            });
        } else if (game.context.phase === "PLAYING") {
            actions.push(
                {
                    name: "moveUnit",
                    steps: ["selectUnit", "selectHex", "confirm"],
                    cost: {
                        type: "dynamic",
                    },
                },
                {
                    name: "placeUnit",
                    steps: ["selectHex", "confirm"],
                    cost: {
                        type: "fixed",
                        amount: 2,
                    },
                    availableCoords: getAllowedPlaceUnitFields(game, playerId),
                },
                {
                    name: "placeTower",
                    steps: ["selectHex", "confirm"],
                    cost: {
                        type: "fixed",
                        amount: 1,
                    },
                    availableCoords: getAllowedPlaceTowerFields(game, playerId),
                },
            );
        }

        return actions;
    }

    async getGameSnapshot(lobbyId: string) {
        const game = await this.getGameByLobby(lobbyId);
        const actions = await this.generateGameActions(lobbyId, game.context.currentPlayerId);

        return {
            ...game,
            availableActions: actions,
        } satisfies GameSnapshot;
    }

    async endPlayerTurn(lobbyId: string) {
        const game = await this.getGameByLobby(lobbyId);
        await this.updateGameState(
            lobbyId,
            produce(game, (draft) => {
                // advance to the next player
                draft.context.playOrderPos++;
                if (draft.context.playOrderPos >= draft.context.totalPlayers) {
                    if (draft.context.phase === "SETUP") {
                        draft.context.playOrderPos = 0;
                        draft.context.phase = "PLAYING";
                        draft.context.innerPhaseIndex = 0;
                    } else {
                        draft.context.turn++;
                        draft.context.playOrderPos = 0;

                        if (draft.context.turn >= 3) {
                            draft.context.turn = 0;
                            draft.context.innerPhaseIndex++;
                        }
                    }
                }

                draft.context.currentPlayerId = draft.context.playOrder[draft.context.playOrderPos];
                draft.boardState.resources[draft.context.currentPlayerId].actionPoints = 5;
            }),
        );
    }

    async placeUnit(lobbyId: string, playerId: string, unit: UnitType, coord: StackedAxial) {
        const game = await this.getGameByLobby(lobbyId);

        if (unit !== "KNIGHT") throw new GameError("INVALID_GAME_OPERATION");

        const allowedFields = getAllowedPlaceUnitFields(game, playerId);
        if (!allowedFields.some((f) => equalStackedAxial(f, coord)))
            throw new GameError("INVALID_GAME_OPERATION");

        await this.updateGameState(
            lobbyId,
            produce(game, (draft) => {
                draft.boardState.units[playerId].push(coord);
            }),
        );

        if (game.context.phase === "SETUP") {
            await this.endPlayerTurn(lobbyId);
        }
    }

    async placeTower(lobbyId: string, playerId: string, coord: StackedAxial) {
        const game = await this.getGameByLobby(lobbyId);

        const allowedFields = getAllowedPlaceTowerFields(game, playerId);
        if (!allowedFields.some((f) => equalStackedAxial(f, coord)))
            throw new GameError("INVALID_GAME_OPERATION");

        await this.updateGameState(
            lobbyId,
            produce(game, (draft) => {
                draft.boardState.towers.push(coord);
            }),
        );
    }

    async moveUnit(_lobbyId: string, _playerId: string, _unit: StackedAxial, _coord: StackedAxial) {
        throw new NotImplementedException();
    }

    async performAction(lobbyId: string, playerId: string, payload: GameActionSubmitPayload) {
        const _game = await this.getGameByLobby(lobbyId);

        // TODO: check if player may perform action
        if (payload.name === "placeUnit") {
            await this.placeUnit(lobbyId, playerId, payload.unit, payload.coord);
            return;
        } else if (payload.name === "placeTower") {
            await this.placeTower(lobbyId, playerId, payload.coord);
            return;
        } else if (payload.name === "moveUnit") {
            await this.moveUnit(lobbyId, playerId, payload.unit, payload.coord);
            return;
        }

        throw new Error("Unknown action type.");
    }
}
