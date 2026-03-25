import { Inject, Injectable, InternalServerErrorException, NotFoundException, forwardRef } from "@nestjs/common";

import { Lobby, Prisma } from "@/generated/prisma/client";
import { LobbyWhereUniqueInput } from "@/generated/prisma/models";
import { PrismaService } from "@/prisma/prisma.service";
import { UserService } from "@/user/user.service";

import { LobbyGateway } from "./lobby.gateway";

@Injectable()
export class LobbyService {
    constructor(
        @Inject(forwardRef(() => LobbyGateway))
        private readonly lobbyGateway: LobbyGateway,
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
    ) {}

    async lobby(where: LobbyWhereUniqueInput) {
        return await this.prisma.lobby.findUnique({
            where,
            include: {
                users: true,
            },
        });
    }
    async lobbies(where: Prisma.LobbyWhereInput): Promise<Lobby[]> {
        return this.prisma.lobby.findMany({
            where,
        });
    }

    async updateLobby({
        where,
        data,
    }: {
        where: Prisma.LobbyWhereUniqueInput;
        data: Prisma.LobbyUpdateInput;
    }): Promise<Lobby> {
        return this.prisma.lobby.update({
            data,
            where,
        });
    }

    /**
     * accepts either the lobby id, the lobby publicId or 'current' to fetch the lobby of the user.
     */
    async resolveLobbyFromId(id: string, userId: string) {
        if (id.length === 4) {
            return await this.lobby({ publicId: id });
        }
        if (id === "current") {
            const lobbyId = await this.getLobbyIdFromUser(userId);
            if (!lobbyId) throw new NotFoundException();

            return await this.lobby({ id: lobbyId });
        }

        return await this.lobby({ id });
    }

    async createLobby(hostUserId: string): Promise<Lobby> {
        const host = await this.userService.user({ id: hostUserId });
        if (!host) throw new InternalServerErrorException("Invalid host token.");

        const publicLobbyId = await this.generatePublicLobbyId();
        const lobby = await this.prisma.lobby.create({
            data: {
                publicId: publicLobbyId,
                state: "WAITING",
                hostUser: {
                    connect: { id: host.id },
                },
                users: {
                    connect: { id: host.id },
                },
            },
        });

        return lobby;
    }

    async joinLobby(lobbyId: string, userId: string): Promise<Lobby> {
        const lobby = await this.lobby({ id: lobbyId });
        if (!lobby) throw new NotFoundException();

        const user = await this.userService.user({ id: userId });
        if (!user) throw new NotFoundException();

        await this.userService.updateUser({
            where: { id: userId },
            data: {
                activeLobby: {
                    connect: {
                        id: lobby.id,
                    },
                },
            },
        });

        void this.lobbyGateway.emitLobbyState(lobby.id);

        return lobby;
    }

    async deleteLobby(lobbyId: string): Promise<boolean> {
        const res = await this.prisma.lobby.delete({ where: { id: lobbyId } });
        return !!res;
    }

    async removeUser(lobbyId: string, userId: string, notify?: boolean): Promise<boolean> {
        const lobby = await this.lobby({ id: lobbyId });
        if (!lobby) throw new NotFoundException();

        const user = await this.userService.user({ id: userId });
        if (!user) throw new NotFoundException();

        const isInLobby = await this.isPlayerInLobby(lobby.id, user.id);
        if (!isInLobby) return false;

        await this.userService.updateUser({
            where: { id: userId },
            data: {
                activeLobby: {
                    disconnect: true,
                },
            },
        });

        if (notify && user.socketId) {
            this.lobbyGateway.server.in(user.socketId).emit("lobby:removed");
        }

        if (lobby.hostUserId === userId) {
            const newHost = await this.prisma.user.findFirst({
                where: { activeLobbyId: lobby.id },
            });
            if (!newHost) {
                await this.deleteLobby(lobby.id);
                return true;
            } else {
                await this.updateLobby({
                    where: { id: lobby.id },
                    data: {
                        hostUser: {
                            connect: {
                                id: newHost.id,
                            },
                        },
                    },
                });
            }
        }

        void this.lobbyGateway.emitLobbyState(lobby.id);

        return true;
    }

    async isPlayerInLobby(lobbyId: string, userId: string): Promise<boolean> {
        return lobbyId === (await this.getLobbyIdFromUser(userId));
    }
    async getLobbyIdFromUser(userId: string): Promise<string | null> {
        const user = await this.userService.user({ id: userId });
        if (!user || !user.activeLobbyId) return null;

        return user.activeLobbyId;
    }

    private async generatePublicLobbyId(): Promise<string> {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        let newId = "";
        let foundLobby: Lobby | null = null;

        do {
            newId = [...Array(4).keys()].map(() => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
            foundLobby = await this.lobby({ publicId: newId });
        } while (foundLobby);

        return newId;
    }
}
