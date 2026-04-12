import { AuthModule } from "@/auth/auth.module";
import { LobbyModule } from "@/lobby/lobby.module";
import { PrismaModule } from "@/prisma/prisma.module";

import { Module } from "@nestjs/common";

import { GameController } from "./game.controller";
import { GameGateway } from "./game.gateway";
import { GameNotifier } from "./game.notifier";
import { GameService } from "./game.service";

@Module({
    imports: [AuthModule, PrismaModule, LobbyModule],
    controllers: [GameController],
    providers: [GameService, GameGateway, GameNotifier],
})
export class GameModule {}
