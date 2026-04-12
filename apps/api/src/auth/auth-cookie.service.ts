import type { ApiEnv } from "@towers/shared/env/api";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { CookieOptions, Response } from "express";

import { ACCESS_TOKEN_COOKIE } from "./auth.constants";

@Injectable()
export class AuthCookieService {
    constructor(private readonly config: ConfigService<ApiEnv>) {}

    private getBaseOptions(): CookieOptions {
        const isProd = this.config.get("NODE_ENV", { infer: true }) === "production";

        return {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
            domain: isProd ? this.config.get("COOKIE_DOMAIN", { infer: true }) : undefined,
        };
    }

    setAccessToken(res: Response, token: string) {
        res.cookie(ACCESS_TOKEN_COOKIE, token, {
            ...this.getBaseOptions(),
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    clearAccessToken(res: Response) {
        res.clearCookie(ACCESS_TOKEN_COOKIE, this.getBaseOptions());
    }
}
