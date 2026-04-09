import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Request, Response } from "express";

import { AuthError } from "@towers/shared/contracts";

import { getAuthErrorHttpStatus } from "./auth-error.mapper";

@Catch(AuthError)
export class AuthHttpExceptionFilter implements ExceptionFilter {
    catch(exception: AuthError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();

        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = getAuthErrorHttpStatus(exception);

        response.status(status).json({
            statusCode: status,
            error: "AuthError",
            code: exception.code,
            message: exception.message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
