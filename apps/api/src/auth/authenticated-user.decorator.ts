import { ExecutionContext, createParamDecorator } from "@nestjs/common";

import { RequestWithUser } from "../types/express";

export const AuthenticatedUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return req.user ?? null;
});

// export const SocketToken = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
//     const req = ctx.switchToWs().getClient<Socket>();
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     const token: string = req.handshake?.auth?.token ?? null;
//     return token;
// });
