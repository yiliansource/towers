import { Module } from "@nestjs/common";

import { LobbyModule } from "@/lobby/lobby.module";
import { PrismaModule } from "@/prisma/prisma.module";

import { GameController } from "./game.controller";
import { GameService } from "./game.service";

@Module({
    imports: [PrismaModule, LobbyModule],
    controllers: [GameController],
    providers: [GameService],
})
export class GameModule {}
