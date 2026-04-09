import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";

import { AuthCookieService } from "./auth-cookie.service";
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

    handleRequest<TUser>(err: any, user: TUser, info: any, context: ExecutionContext) {
        const res = context.switchToHttp().getResponse<Response>();

        if (err || !user) {
            this.authCookieService.clearAccessToken(res);
            // TODO: the user might be presented with a corrupted screen; we should redirect them to the login page here

            throw err || new UnauthorizedException();
        }
        return user;
    }
}
