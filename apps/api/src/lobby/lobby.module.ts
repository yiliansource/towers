import { AuthModule } from "@/auth/auth.module";
import { PrismaModule } from "@/prisma/prisma.module";
import { UserModule } from "@/user/user.module";

import { forwardRef, Module } from "@nestjs/common";

import { LobbyController } from "./lobby.controller";
import { LobbyGateway } from "./lobby.gateway";
import { LobbyMapper } from "./lobby.mapper";
import { LobbyNotifier } from "./lobby.notifier";
import { LobbyService } from "./lobby.service";
import { LobbyPresenceService } from "./lobby-presence.service";

@Module({
    imports: [AuthModule, PrismaModule, forwardRef(() => UserModule)],
    controllers: [LobbyController],
    providers: [LobbyService, LobbyGateway, LobbyMapper, LobbyNotifier, LobbyPresenceService],
    exports: [LobbyService, LobbyNotifier, LobbyMapper, LobbyPresenceService],
})
export class LobbyModule {}
