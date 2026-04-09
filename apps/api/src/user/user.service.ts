import { Injectable } from "@nestjs/common";

import type { Prisma, User } from "@/generated/prisma/client";
import type { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return await this.prisma.user.create({
            data,
        });
    }
    async getUserById(userId: string): Promise<User | null> {
        return await this.prisma.user.findUnique({ where: { id: userId } });
    }
    async getUserByName(username: string): Promise<User | null> {
        return await this.prisma.user.findUnique({ where: { username } });
    }
    async getUserBySocket(socketId: string): Promise<User | null> {
        return await this.prisma.user.findFirst({ where: { socketId } });
    }

    async getSocketId(userId: string): Promise<string | null> {
        const user = await this.getUserById(userId);
        if (user) return user.socketId;
        return null;
    }
    async registerSocket(userId: string, socketId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { socketId },
        });
    }
    async clearSocket(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { socketId: null },
        });
    }
}
