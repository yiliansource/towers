import { Injectable } from "@nestjs/common";

import { Prisma, User } from "@/generated/prisma/client";
import { PrismaService } from "@/prisma/prisma.service";

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
        return await this.prisma.user.findUnique({ where: { socketId } });
    }

    async registerSocket(userId: string, socketId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { socketId },
        });
    }
    async clearSocket(socketId: string): Promise<void> {
        const user = await this.getUserBySocket(socketId);
        if (!user) return;

        await this.prisma.user.update({
            where: { id: user.id },
            data: { socketId: null },
        });
    }
}
