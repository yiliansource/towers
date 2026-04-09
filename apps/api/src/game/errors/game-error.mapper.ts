import { HttpStatus } from "@nestjs/common";

import type { GameError } from "@towers/shared/contracts";

export function getGameErrorHttpStatus(error: GameError): HttpStatus {
    switch (error.code) {
        default:
            return HttpStatus.BAD_REQUEST;
    }
}
