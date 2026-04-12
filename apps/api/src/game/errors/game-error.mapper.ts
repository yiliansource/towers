import type { GameError } from "@towers/shared/contracts";

import { HttpStatus } from "@nestjs/common";

export function getGameErrorHttpStatus(error: GameError): HttpStatus {
    switch (error.code) {
        default:
            return HttpStatus.BAD_REQUEST;
    }
}
