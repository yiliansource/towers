import { LobbyError, type LobbyErrorHttpResponse } from "@towers/shared/contracts";

import { type ArgumentsHost, Catch, type ExceptionFilter } from "@nestjs/common";
import type { Request, Response } from "express";

import { getLobbyErrorHttpStatus, mapLobbyError } from "./lobby-error.mapper";

@Catch(LobbyError)
export class LobbyHttpExceptionFilter implements ExceptionFilter {
    catch(exception: LobbyError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();

        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = getLobbyErrorHttpStatus(exception);

        response.status(status).json({
            statusCode: status,
            path: request.url,
            ...mapLobbyError(exception),
        } satisfies LobbyErrorHttpResponse);
    }
}
