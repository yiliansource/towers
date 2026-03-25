import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import type { Response } from "express";

import { LoginInputSchema, RegisterInputSchema } from "@towers/shared/contracts/auth";
import type { LoginInput, RegisterInput, UserView } from "@towers/shared/contracts/auth";

import { UseZodSchema } from "@/common/use-zod-schema.decorator";
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
    ) {}

    @Post("register")
    @UseZodSchema(RegisterInputSchema)
    @NoAuth()
    async handleRegister(@Body() dto: RegisterInput, @Res({ passthrough: true }) res: Response): Promise<UserView> {
        const user = await this.authService.registerUser(dto.username, dto.password, res);
        return await this.userMapper.toView(user);
    }

    @Post("login")
    @UseZodSchema(LoginInputSchema)
    @NoAuth()
    async handleLogin(@Body() dto: LoginInput, @Res({ passthrough: true }) res: Response): Promise<UserView> {
        const user = await this.authService.loginUser(dto.username, dto.password, res);
        return await this.userMapper.toView(user);
    }

    @Get("me")
    async getSelf(@AuthenticatedUser() user: User): Promise<UserView> {
        return await this.userMapper.toView(user);
    }

    @Post("logout")
    logout(@Res({ passthrough: true }) res: Response) {
        this.authService.logoutUser(res);
        return { ok: true };
    }
}
