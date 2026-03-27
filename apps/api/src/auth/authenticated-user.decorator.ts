import { ExecutionContext, createParamDecorator } from "@nestjs/common";

import { User } from "@/generated/prisma/client";

import { RequestWithUser } from "../types/express";

export const AuthenticatedUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    return (req.user as User | undefined) ?? null;
});

// export const SocketToken = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
//     const req = ctx.switchToWs().getClient<Socket>();
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     const token: string = req.handshake?.auth?.token ?? null;
//     return token;
// });
