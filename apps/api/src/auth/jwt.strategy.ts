import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

import { AuthService } from "./auth.service";

function cookieExtractor(req: Request): string | null {
    if (!req?.cookies) return null;
    return (req.cookies["access_token"] as string) ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET as string,
        });
    }

    async validate(payload: { sub: string; name: string }) {
        return this.authService.validateJwtPayload(payload);
    }
}
