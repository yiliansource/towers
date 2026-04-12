import { ApiEnvSchema } from "@towers/shared/env/api";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";

import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { GameModule } from "./game/game.module";
import { LobbyModule } from "./lobby/lobby.module";
import { UserModule } from "./user/user.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: (config) => {
                const parsed = ApiEnvSchema.safeParse(config);
                if (!parsed.success) {
                    console.error(
                        "Invalid environment variables:",
                        parsed.error.flatten().fieldErrors,
                    );
                    throw new Error("Invalid environment variables");
                }

                return parsed.data;
            },
        }),
        AuthModule,
        GameModule,
        UserModule,
        LobbyModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
