import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { User } from "@/generated/prisma/client";

import type { RequestWithUser } from "../types/express";
import type { AuthSocket } from "./socket-auth.service";

export const AuthenticatedUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    return (req.user as User | undefined) ?? null;
});

export const AuthenticatedSocketUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const socket = ctx.switchToWs().getClient<AuthSocket>();
        return socket.data.user;
    },
);

// export const SocketToken = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
//     const req = ctx.switchToWs().getClient<Socket>();
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     const token: string = req.handshake?.auth?.token ?? null;
//     return token;
// });
