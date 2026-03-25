import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { CookieOptions, Response } from "express";

import { ApiEnv } from "@towers/shared/env/api";

import { UserService } from "@/user/user.service";

import { AuthJwtPayload } from "./auth.types";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService<ApiEnv, true>,
    ) {}

    async registerUser(username: string, password: string, res: Response) {
        const passwordHash = await argon2.hash(password);
        const user = await this.userService.createUser({
            username,
            passwordHash,
        });

        const token = await this.issueToken(user.id, user.username);
        this.setAccessTokenCookie(res, token);

        return user;
    }

    async loginUser(username: string, password: string, res: Response) {
        const user = await this.userService.user({ username });
        if (!user) throw new UnauthorizedException("invalid credentials");

        const valid = await argon2.verify(user.passwordHash, password);
        if (!valid) throw new UnauthorizedException("invalid credentials");

        const token = await this.issueToken(user.id, user.username);
        this.setAccessTokenCookie(res, token);

        return user;
    }

    logoutUser(res: Response) {
        this.clearAccessTokenCookie(res);
    }

    private async issueToken(userId: string, username: string) {
        const payload: AuthJwtPayload = {
            sub: userId,
            name: username,
        };

        const accessToken = await this.jwtService.signAsync(payload);
        return accessToken;
    }

    async validateJwtPayload(payload: AuthJwtPayload) {
        const user = await this.userService.user({ id: payload.sub });
        if (!user) throw new UnauthorizedException();

        return user;
    }

    async verifyToken(token: string) {
        const payload = await this.jwtService.verifyAsync<AuthJwtPayload>(token, {
            secret: this.config.get("JWT_SECRET", { infer: true }),
        });

        return this.validateJwtPayload(payload);
    }

    // TODO: decouple authservice from express

    private getAccessTokenCookieOptions(): CookieOptions {
        const isProd = this.config.get("NODE_ENV", { infer: true }) === "production";

        return {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
            domain: isProd ? this.config.get("COOKIE_DOMAIN", { infer: true }) : undefined,
        };
    }

    private setAccessTokenCookie(res: Response, token: string) {
        res.cookie("access_token", token, {
            ...this.getAccessTokenCookieOptions(),
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    private clearAccessTokenCookie(res: Response) {
        res.clearCookie("access_token", this.getAccessTokenCookieOptions());
    }
}
