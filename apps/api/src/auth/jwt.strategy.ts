import type { ApiEnv } from "@towers/shared/env/api";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

import { ACCESS_TOKEN_COOKIE } from "./auth.constants";
import { AuthService } from "./auth.service";

function cookieExtractor(req: Request): string | null {
    if (!req?.cookies) return null;
    return (req.cookies[ACCESS_TOKEN_COOKIE] as string) ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
        readonly configService: ConfigService<ApiEnv, true>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
            ignoreExpiration: false,
            secretOrKey: configService.get("JWT_SECRET", { infer: true }),
        });
    }

    async validate(payload: { sub: string; name: string }) {
        return this.authService.validateJwtPayload(payload);
    }
}
