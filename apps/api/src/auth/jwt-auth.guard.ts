import { type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import type { Response } from "express";

import type { AuthCookieService } from "./auth-cookie.service";
import { NO_AUTH_KEY } from "./no-auth.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    constructor(
        private readonly reflector: Reflector,
        private readonly authCookieService: AuthCookieService,
    ) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(NO_AUTH_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }

    // biome-ignore lint/suspicious/noExplicitAny: not sure what else
    handleRequest<TUser>(err: any, user: TUser, _info: any, context: ExecutionContext) {
        const res = context.switchToHttp().getResponse<Response>();

        if (err || !user) {
            this.authCookieService.clearAccessToken(res);
            // TODO: the user might be presented with a corrupted screen; we should redirect them to the login page here

            throw err || new UnauthorizedException();
        }
        return user;
    }
}
