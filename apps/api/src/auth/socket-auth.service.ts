import { Injectable, UnauthorizedException } from "@nestjs/common";
import { parse } from "cookie";
import { EventsMap } from "node_modules/socket.io/dist/typed-events";
import { DefaultEventsMap, Server, Socket } from "socket.io";

import { UserService } from "@/user/user.service";

import { AuthService } from "./auth.service";
import { AuthSocketData } from "./auth.types";

export type AuthServer<CTS extends EventsMap = DefaultEventsMap, STC extends EventsMap = DefaultEventsMap> = Server<
    CTS,
    STC,
    object,
    AuthSocketData
>;
export type AuthSocket<CTS extends EventsMap = DefaultEventsMap, STC extends EventsMap = DefaultEventsMap> = Socket<
    CTS,
    STC,
    object,
    AuthSocketData
>;

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
        const token = cookies["access_token"];
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
