import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { UserService } from "src/user/user.service";

import { AuthJwtPayload } from "./auth.types";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async registerUser(username: string, password: string) {
        const passwordHash = await argon2.hash(password);

        const user = await this.userService.createUser({
            username,
            passwordHash,
        });

        return {
            token: await this.issueToken(user.id, user.username),
            user,
        };
    }

    async loginUser(username: string, password: string) {
        const user = await this.userService.user({ username });
        if (!user) throw new UnauthorizedException("invalid credentials");

        const valid = await argon2.verify(user.passwordHash, password);
        if (!valid) throw new UnauthorizedException("invalid credentials");

        return {
            token: await this.issueToken(user.id, user.username),
            user,
        };
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
            secret: process.env.JWT_SECRET,
        });

        return this.validateJwtPayload(payload);
    }
}
