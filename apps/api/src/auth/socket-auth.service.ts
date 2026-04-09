/** biome-ignore-all lint/suspicious/noExplicitAny: libraries */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { parse } from "cookie";
import type { DefaultEventsMap, Server, Socket } from "socket.io";

import type { UserService } from "@/user/user.service";

import { ACCESS_TOKEN_COOKIE } from "./auth.constants";
import type { AuthService } from "./auth.service";
import type { AuthSocketData } from "./auth.types";

export type AuthServer<
    CTS extends Record<string, any> = DefaultEventsMap,
    STC extends Record<string, any> = DefaultEventsMap,
> = Server<CTS, STC, object, AuthSocketData>;
export type AuthSocket<
    CTS extends Record<string, any> = DefaultEventsMap,
    STC extends Record<string, any> = DefaultEventsMap,
> = Socket<CTS, STC, object, AuthSocketData>;

@Injectable()
export class SocketAuthService {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}

    async authenticate(socket: Socket) {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
            throw new UnauthorizedException("Missing cookie header");
        }

        const cookies = parse(cookieHeader);
        const token = cookies[ACCESS_TOKEN_COOKIE];
        if (!token) {
            throw new UnauthorizedException("Missing auth cookie");
        }

        const user = await this.authService.verifyToken(token);
        return user;
    }
    async disconnect(socket: AuthSocket) {
        await this.userService.clearSocket(socket.id);
    }
}
