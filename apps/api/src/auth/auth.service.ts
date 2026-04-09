import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { JwtService } from "@nestjs/jwt";
import { AuthError } from "@towers/shared/contracts";
import type { ApiEnv } from "@towers/shared/env/api";
import * as argon2 from "argon2";

import type { User } from "@/generated/prisma/client";
import type { UserService } from "@/user/user.service";

import type { AuthJwtPayload } from "./auth.types";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService<ApiEnv, true>,
    ) {}

    async registerUser(username: string, password: string): Promise<{ user: User; token: string }> {
        const passwordHash = await argon2.hash(password);
        try {
            const user = await this.userService.createUser({
                username,
                passwordHash,
            });

            const token = await this.issueToken(user.id, user.username);

            return { user, token };
        } catch {
            throw new AuthError("USERNAME_EXISTS");
        }
    }

    async loginUser(username: string, password: string): Promise<{ user: User; token: string }> {
        const user = await this.userService.getUserByName(username);
        if (!user) throw new AuthError("INVALID_CREDENTIALS");

        const valid = await argon2.verify(user.passwordHash, password);
        if (!valid) throw new AuthError("INVALID_CREDENTIALS");

        const token = await this.issueToken(user.id, user.username);

        return { user, token };
    }

    private async issueToken(userId: string, username: string): Promise<string> {
        const payload: AuthJwtPayload = {
            sub: userId,
            name: username,
        };

        const accessToken = await this.jwtService.signAsync(payload);
        return accessToken;
    }

    async verifyToken(token: string) {
        const payload = await this.jwtService.verifyAsync<AuthJwtPayload>(token, {
            secret: this.config.get("JWT_SECRET", { infer: true }),
        });

        return await this.validateJwtPayload(payload);
    }

    async validateJwtPayload(payload: AuthJwtPayload) {
        const user = await this.userService.getUserById(payload.sub);
        if (!user) throw new UnauthorizedException();

        return user;
    }
}
