import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Request, Response } from "express";

import { GameError } from "@towers/shared/contracts/game";

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
