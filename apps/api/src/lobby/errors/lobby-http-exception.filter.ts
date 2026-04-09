import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Request, Response } from "express";

import { LobbyError, LobbyErrorHttpResponse } from "@towers/shared/contracts";

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
