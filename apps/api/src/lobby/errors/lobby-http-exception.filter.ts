import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Request, Response } from "express";

import { LobbyError } from "@towers/shared/contracts/lobby";

import { getLobbyErrorHttpStatus } from "./lobby-error.mapper";

@Catch(LobbyError)
export class LobbyHttpExceptionFilter implements ExceptionFilter {
    catch(exception: LobbyError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();

        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = getLobbyErrorHttpStatus(exception);

        response.status(status).json({
            statusCode: status,
            error: "LobbyError",
            code: exception.code,
            message: exception.message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
