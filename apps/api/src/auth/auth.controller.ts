import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { CookieOptions, Response } from "express";

import { LoginInputSchema, RegisterInputSchema } from "@towers/shared/contracts/auth";
import type { LoginInput, RegisterInput, UserView } from "@towers/shared/contracts/auth";
import { ApiEnv } from "@towers/shared/env/api";

import { UseZodSchema } from "@/common/decorators/use-zod-schema.decorator";
import type { User } from "@/generated/prisma/client";
import { UserMapper } from "@/user/user.mapper";
import { UserService } from "@/user/user.service";

import { AuthService } from "./auth.service";
import { AuthenticatedUser } from "./authenticated-user.decorator";
import { NoAuth } from "./no-auth.decorator";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly userMapper: UserMapper,
        private readonly authService: AuthService,
        private readonly config: ConfigService<ApiEnv>,
    ) {}

    @Post("register")
    @UseZodSchema(RegisterInputSchema)
    @NoAuth()
    async handleRegister(@Body() dto: RegisterInput, @Res({ passthrough: true }) res: Response): Promise<UserView> {
        const { user, token } = await this.authService.registerUser(dto.username, dto.password);
        this.setAccessTokenCookie(res, token);
        return await this.userMapper.toView(user);
    }

    @Post("login")
    @UseZodSchema(LoginInputSchema)
    @NoAuth()
    async handleLogin(@Body() dto: LoginInput, @Res({ passthrough: true }) res: Response): Promise<UserView> {
        const { user, token } = await this.authService.loginUser(dto.username, dto.password);
        this.setAccessTokenCookie(res, token);
        return await this.userMapper.toView(user);
    }

    @Get("me")
    async getSelf(@AuthenticatedUser() user: User): Promise<UserView> {
        return await this.userMapper.toView(user);
    }

    @Post("logout")
    logout(@Res({ passthrough: true }) res: Response) {
        this.clearAccessTokenCookie(res);
        return { ok: true };
    }

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
