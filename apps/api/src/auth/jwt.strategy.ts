import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

import { ApiEnv } from "@towers/shared/env/api";

import { AuthService } from "./auth.service";

function cookieExtractor(req: Request): string | null {
    if (!req?.cookies) return null;
    return (req.cookies["access_token"] as string) ?? null;
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
