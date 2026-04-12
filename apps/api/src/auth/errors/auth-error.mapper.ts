import type { AuthError } from "@towers/shared/contracts";

import { HttpStatus } from "@nestjs/common";

export function getAuthErrorHttpStatus(error: AuthError): HttpStatus {
    switch (error.code) {
        default:
            return HttpStatus.BAD_REQUEST;
    }
}
