import { Injectable, NotImplementedException } from "@nestjs/common";
import { InputJsonValue } from "@prisma/client/runtime/client";
import { randomUUID } from "crypto";

import { GameState } from "@towers/shared/contracts/game";
import { LobbyError } from "@towers/shared/contracts/lobby";
import { axial, stringifyAxial } from "@towers/shared/hexgrid";

import { Lobby, Prisma } from "@/generated/prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { UserService } from "@/user/user.service";

import { LobbyNotifier } from "./lobby.notifier";
import { LobbyWithRelations } from "./lobby.types";

const lobbyIncludes = {
    host: {
        select: {
            id: true,
            username: true,
            socketId: true,
        },
    },
    seats: {
        orderBy: { slot: "asc" },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    socketId: true,
                },
            },
        },
    },
} satisfies Prisma.LobbyInclude;

@Injectable()
export class LobbyService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly lobbyNotifier: LobbyNotifier,
    ) {}

    async createLobby(hostUserId: string): Promise<LobbyWithRelations> {
        return await this.prisma.lobby.create({
            data: {
                state: "WAITING",
                publicId: await this.generatePublicLobbyId(),
                hostId: hostUserId,
                seats: {
                    createMany: {
                        data: [
                            {
                                slot: 0,
                                userId: hostUserId,
                            },
                            ...Array.from(Array(3).keys()).map((i) => ({
                                slot: i + 1,
                                userId: null,
                            })),
                        ],
                    },
                },
            },
            include: lobbyIncludes,
        });
    }
    async getLobbyById(lobbyId: string): Promise<LobbyWithRelations | null> {
        return await this.prisma.lobby.findUnique({
            where: { id: lobbyId },
            include: lobbyIncludes,
        });
    }
    async getLobbyByPublicId(publicLobbyId: string): Promise<LobbyWithRelations | null> {
        return await this.prisma.lobby.findUnique({
            where: { publicId: publicLobbyId },
            include: lobbyIncludes,
        });
    }
    async getLobbyByUser(userId: string): Promise<LobbyWithRelations | null> {
        const seat = await this.prisma.lobbySeat.findUnique({ where: { userId } });
        if (!seat) return null;

        return await this.getLobbyById(seat.lobbyId);
    }
    async getLobbyByContext(id: string, userId: string): Promise<LobbyWithRelations | null> {
        if (id.length === 4) {
            return await this.getLobbyByPublicId(id);
        } else if (id === "current") {
            return await this.getLobbyByUser(userId);
        } else {
            return await this.getLobbyById(id);
        }
    }

    async joinLobby(userId: string, publicId: string): Promise<LobbyWithRelations> {
        const lobby = await this.getLobbyByPublicId(publicId);
        if (!lobby) throw new LobbyError("LOBBY_NOT_FOUND");
        if (lobby.state !== "WAITING") throw new LobbyError("LOBBY_ALREADY_STARTED");

        const seats = lobby.seats;
        if (seats.some((s) => s.userId === userId)) throw new LobbyError("USER_ALREADY_IN_THIS_LOBBY");

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { lobbySeat: true },
        });
        if (!user) throw new Error("User not found.");
        if (user.lobbySeat) throw new LobbyError("USER_ALREADY_IN_LOBBY");

        const freeSeat = seats.find((s) => !s.userId);
        if (!freeSeat) throw new LobbyError("LOBBY_FULL");

        await this.prisma.lobbySeat.update({
            where: { id: freeSeat.id },
            data: { userId: user.id },
        });

        this.lobbyNotifier.emitLobbyUpdate(lobby.id);

        return (await this.getLobbyById(lobby.id))!;
    }
    async leaveLobby(userId: string): Promise<void> {
        const lobby = await this.getLobbyByUser(userId);
        if (!lobby) throw new LobbyError("USER_NOT_IN_LOBBY");

        if (lobby.host.id === userId) {
            const nextHostCandidateSeat = lobby.seats.find((s) => !!s.userId && s.userId !== userId);
            if (!nextHostCandidateSeat) {
                // lobby empty after leave
                await this.prisma.lobby.delete({ where: { id: lobby.id } });
                return;
            }

            await this.prisma.lobby.update({
                where: { id: lobby.id },
                data: {
                    hostId: nextHostCandidateSeat.userId!,
                },
            });
        }

        await this.prisma.lobbySeat.update({
            where: { userId },
            data: { userId: null },
        });

        this.lobbyNotifier.emitLobbyUpdate(lobby.id);
    }

    async kickPlayer(lobbyId: string, targetUserId: string): Promise<void> {
        throw new NotImplementedException();
    }
    async changeHost(lobbyId: string, newHostUserId: string): Promise<void> {
        throw new NotImplementedException();
    }

    async changeSlot(lobbyId: string, userId: string, slot: number): Promise<void> {
        const lobby = await this.getLobbyByUser(userId);
        if (!lobby) throw new LobbyError("USER_NOT_IN_LOBBY");

        const oldSlot = (await this.prisma.lobbySeat.findUnique({ where: { userId } }))!;
        const newSlot = (await this.prisma.lobbySeat.findFirst({ where: { lobbyId, slot } }))!;

        if (newSlot.userId) throw new LobbyError("SEAT_OCCUPIED");

        await this.prisma.lobbySeat.update({
            where: { id: oldSlot.id },
            data: { userId: null },
        });
        await this.prisma.lobbySeat.update({
            where: { id: newSlot.id },
            data: { userId },
        });

        this.lobbyNotifier.emitLobbyUpdate(lobby.id);
    }

    async startGame(lobbyId: string): Promise<void> {
        const lobby = await this.getLobbyById(lobbyId);
        if (!lobby) throw new LobbyError("LOBBY_NOT_FOUND");
        if (lobby.state === "INGAME") throw new LobbyError("LOBBY_ALREADY_STARTED");

        await this.prisma.lobby.update({
            where: { id: lobbyId },
            data: { state: "INGAME" },
        });
        await this.updateGameState(lobbyId, {
            turn: 0,
            phase: "SETUP",
            activePlayerId: lobby.seats.find((s) => !!s.userId)!.userId!,
            gameId: randomUUID(),
            towers: [axial(0, 0), axial(3, -3), axial(0, -3), axial(-3, 0), axial(-3, 3), axial(0, 3), axial(3, 0)].map(
                stringifyAxial,
            ),
        });

        this.lobbyNotifier.notify({ type: "lobby.started", lobbyId: lobby.id });
    }
    async finishGame(lobbyId: string): Promise<void> {
        const lobby = await this.getLobbyById(lobbyId);
        if (!lobby) throw new LobbyError("LOBBY_NOT_FOUND");
        if (lobby.state !== "INGAME") throw new Error();

        await this.prisma.lobby.update({
            where: { id: lobbyId },
            data: { state: "WAITING" },
        });
        await this.updateGameState(lobbyId, null);
    }

    async updateGameState(lobbyId: string, game: GameState | null): Promise<void> {
        await this.prisma.lobby.update({
            where: { id: lobbyId },
            data: { game: game as InputJsonValue },
        });
    }

    private async generatePublicLobbyId(): Promise<string> {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        let newId = "";
        let foundLobby: Lobby | null = null;

        do {
            newId = [...Array(4).keys()].map(() => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
            foundLobby = await this.getLobbyByPublicId(newId);
        } while (foundLobby);

        return newId;
    }
}
