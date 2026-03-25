import { Module } from "@nestjs/common";

import { PrismaModule } from "@/prisma/prisma.module";

import { UserMapper } from "./user.mapper";
import { UserService } from "./user.service";

@Module({
    imports: [PrismaModule],
    providers: [UserService, UserMapper],
    exports: [UserService, UserMapper],
})
export class UserModule {}
