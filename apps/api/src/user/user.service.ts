import { Injectable } from "@nestjs/common";

import { Prisma, User } from "@/generated/prisma/client";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async user(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: userWhereUniqueInput,
        });
    }
    async users(userWhereInput: Prisma.UserWhereInput): Promise<User[]> {
        return this.prisma.user.findMany({
            where: userWhereInput,
        });
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }

    async updateUser({
        where,
        data,
    }: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<User> {
        return this.prisma.user.update({
            data,
            where,
        });
    }

    async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
        return this.prisma.user.delete({
            where,
        });
    }

    async connectSocket(where: Prisma.UserWhereUniqueInput, socketId: string): Promise<void> {
        await this.updateUser({
            where,
            data: {
                socketId,
                connected: true,
            },
        });
    }
    async disconnectSocket(socketId: string) {
        const user = await this.user({ socketId });
        if (!user) return;

        await this.updateUser({
            where: { id: user.id },
            data: {
                socketId: null,
                connected: false,
            },
        });
    }

    async userToSocket(userId: string): Promise<string | null> {
        const user = await this.user({ id: userId });
        return user?.socketId ?? null;
    }
}
