import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";

import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = app.get(ConfigService);

    app.use(cookieParser());
    app.enableCors({
        origin: config.get<string>("WEB_URL"),
        credentials: true,
    });

    await app.listen(config.get<number>("PORT") ?? 3001);
}
void bootstrap();
