import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { IsString, Length } from "class-validator";
import type { Response } from "express";
import { UserMapper } from "src/user/user.mapper";
import { UserService } from "src/user/user.service";

import type { LoginPayload, UserView } from "@towers/shared";

import type { User } from "@/generated/prisma/client";

import { AuthService } from "./auth.service";
import { AuthenticatedUser } from "./authenticated-user.decorator";
import { NoAuth } from "./no-auth.decorator";

class RegisterDto implements LoginPayload {
    @IsString()
    @Length(3, 20)
    username!: string;

    @IsString()
    @Length(8, 72)
    password!: string;
}

class LoginDto implements LoginPayload {
    @IsString()
    username!: string;

    @IsString()
    @Length(8, 72)
    password!: string;
}

@Controller("auth")
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly userMapper: UserMapper,
        private readonly authService: AuthService,
    ) {}

    @Post("register")
    @NoAuth()
    async handleRegister(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response): Promise<UserView> {
        const { user, token } = await this.authService.registerUser(dto.username, dto.password);
        this.setAccessToken(res, token);
        return await this.userMapper.toView(user);
    }

    @Post("login")
    @NoAuth()
    async handleLogin(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<UserView> {
        const { user, token } = await this.authService.loginUser(dto.username, dto.password);
        this.setAccessToken(res, token);
        return await this.userMapper.toView(user);
    }

    private setAccessToken(res: Response, token: string) {
        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    @Get("me")
    async getSelf(@AuthenticatedUser() user: User): Promise<UserView> {
        return await this.userMapper.toView(user);
    }

    @Post("logout")
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie("access_token");

        return { ok: true };
    }
}
