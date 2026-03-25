import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";

import { ApiEnv } from "@towers/shared/env/api";

import { AppModule } from "./app.module";

async function bootstrap() {
    const logger = new Logger(bootstrap.name);
    const app = await NestFactory.create(AppModule);

    const config = app.get<ConfigService<ApiEnv, true>>(ConfigService);

    app.use(cookieParser());
    app.enableCors({
        origin:
            config.get("NODE_ENV", { infer: true }) === "production"
                ? config.get("CLIENT_ORIGIN", { infer: true })
                : ["http://localhost:3000"],
        credentials: true,
    });

    const port = config.get("PORT", { infer: true }) ?? 3001;
    await app.listen(port);
    logger.log(`Listening on port ${port}.`);
}
void bootstrap();
