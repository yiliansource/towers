import { type ArgumentsHost, Catch, type ExceptionFilter } from "@nestjs/common";
import { GameError } from "@towers/shared/contracts";
import type { Request, Response } from "express";

import { getGameErrorHttpStatus } from "./game-error.mapper";

@Catch(GameError)
export class GameHttpExceptionFilter implements ExceptionFilter {
    catch(exception: GameError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();

        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = getGameErrorHttpStatus(exception);

        response.status(status).json({
            statusCode: status,
            error: "GameError",
            code: exception.code,
            message: exception.message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
