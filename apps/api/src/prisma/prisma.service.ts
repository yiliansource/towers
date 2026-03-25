import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { ApiEnv } from "@towers/shared/env/api";

import { PrismaClient } from "../generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(readonly config: ConfigService<ApiEnv, true>) {
        const adapter = new PrismaBetterSqlite3({ url: config.get("DATABASE_URL", { infer: true }) });
        super({ adapter });
    }
}
