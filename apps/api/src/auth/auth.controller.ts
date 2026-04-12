import {
    type LoginInput,
    LoginInputSchema,
    type RegisterInput,
    RegisterInputSchema,
    type UserView,
} from "@towers/shared/contracts";

import { UseZodSchema } from "@/common/decorators/use-zod-schema.decorator";
import type { User } from "@/generated/prisma/client";
import { UserMapper } from "@/user/user.mapper";

import { Body, Controller, Get, Post, Res, UseFilters } from "@nestjs/common";
import type { Response } from "express";

import { AuthService } from "./auth.service";
import { AuthCookieService } from "./auth-cookie.service";
import { AuthenticatedUser } from "./authenticated-user.decorator";
import { AuthHttpExceptionFilter } from "./errors/auth-http-exception-filter";
import { NoAuth } from "./no-auth.decorator";

@Controller("auth")
@UseFilters(AuthHttpExceptionFilter)
export class AuthController {
    constructor(
        private readonly userMapper: UserMapper,
        private readonly authService: AuthService,
        private readonly authCookieService: AuthCookieService,
    ) {}

    @Post("register")
    @UseZodSchema(RegisterInputSchema)
    @NoAuth()
    async handleRegister(
        @Body() dto: RegisterInput,
        @Res({ passthrough: true }) res: Response,
    ): Promise<UserView> {
        const { user, token } = await this.authService.registerUser(dto.username, dto.password);
        this.authCookieService.setAccessToken(res, token);
        return await this.userMapper.toView(user);
    }

    @Post("login")
    @UseZodSchema(LoginInputSchema)
    @NoAuth()
    async handleLogin(
        @Body() dto: LoginInput,
        @Res({ passthrough: true }) res: Response,
    ): Promise<UserView> {
        const { user, token } = await this.authService.loginUser(dto.username, dto.password);
        this.authCookieService.setAccessToken(res, token);
        return await this.userMapper.toView(user);
    }

    @Get("me")
    async getSelf(@AuthenticatedUser() user: User): Promise<UserView> {
        return await this.userMapper.toView(user);
    }

    @Post("logout")
    @NoAuth()
    logout(@Res({ passthrough: true }) res: Response) {
        this.authCookieService.clearAccessToken(res);
        return { ok: true };
    }
}
