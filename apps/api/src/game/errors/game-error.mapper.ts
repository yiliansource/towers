import { HttpStatus } from "@nestjs/common";

import { GameError } from "@towers/shared/contracts/game";

export function getGameErrorHttpStatus(error: GameError): HttpStatus {
    switch (error.code) {
        default:
            return HttpStatus.BAD_REQUEST;
    }
}
