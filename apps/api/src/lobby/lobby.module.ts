import { Module, forwardRef } from "@nestjs/common";

import { AuthModule } from "@/auth/auth.module";
import { PrismaModule } from "@/prisma/prisma.module";
import { UserModule } from "@/user/user.module";

import { LobbyController } from "./lobby.controller";
import { LobbyGateway } from "./lobby.gateway";
import { LobbyMapper } from "./lobby.mapper";
import { LobbyService } from "./lobby.service";

@Module({
    imports: [AuthModule, PrismaModule, forwardRef(() => UserModule)],
    controllers: [LobbyController],
    providers: [LobbyService, LobbyGateway, LobbyMapper],
    exports: [LobbyService, LobbyMapper],
})
export class LobbyModule {}
