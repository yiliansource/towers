import { Module, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { ApiEnv } from "@towers/shared/env/api";

import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { SocketAuthService } from "./socket-auth.service";

@Module({
    imports: [
        forwardRef(() => UserModule),
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService<ApiEnv, true>) => ({
                secret: config.get("JWT_SECRET", { infer: true }),
                signOptions: {
                    expiresIn: config.get("JWT_EXPIRES_IN", { infer: true }),
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, SocketAuthService],
    exports: [AuthService, SocketAuthService],
})
export class AuthModule {}
