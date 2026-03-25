import { Injectable, UnauthorizedException } from "@nestjs/common";
import { parse } from "cookie";
import { Server, Socket } from "socket.io";

import { ClientToServerEvents, ServerToClientEvents } from "@towers/shared";

import { User } from "@/generated/prisma/client";
import { UserService } from "@/user/user.service";

import { AuthService } from "./auth.service";

export type AuthSocketData = {
    user: User;
};

export type AuthServer = Server<ClientToServerEvents, ServerToClientEvents, object, AuthSocketData>;
export type AuthSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, AuthSocketData>;

@Injectable()
export class SocketAuthService {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}

    async authenticate(socket: AuthSocket) {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
            throw new UnauthorizedException("Missing cookie header");
        }

        const cookies = parse(cookieHeader);
        const token = cookies["access_token"];
        if (!token) {
            throw new UnauthorizedException("Missing auth cookie");
        }

        const user = await this.authService.verifyToken(token);

        socket.data.user = user;
        await this.userService.connectSocket({ id: user.id }, socket.id);

        return user;
    }
    async disconnect(socket: AuthSocket) {
        await this.userService.disconnectSocket(socket.id);
    }
}
