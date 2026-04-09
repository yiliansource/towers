import { HttpStatus } from "@nestjs/common";

import { AuthError } from "@towers/shared/contracts";

export function getAuthErrorHttpStatus(error: AuthError): HttpStatus {
    switch (error.code) {
        default:
            return HttpStatus.BAD_REQUEST;
    }
}
