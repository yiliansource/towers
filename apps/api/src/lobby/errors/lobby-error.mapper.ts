import { HttpStatus } from "@nestjs/common";

import type { LobbyError, LobbyErrorReponseBase } from "@towers/shared/contracts";

export function getLobbyErrorHttpStatus(error: LobbyError): HttpStatus {
    switch (error.code) {
        case "LOBBY_NOT_FOUND":
        case "USER_NOT_IN_LOBBY":
            return HttpStatus.NOT_FOUND;

        case "NOT_LOBBY_HOST":
            return HttpStatus.FORBIDDEN;

        case "LOBBY_FULL":
        case "USER_ALREADY_IN_LOBBY":
        case "USER_ALREADY_IN_THIS_LOBBY":
        case "LOBBY_ALREADY_STARTED":
        case "SEAT_OCCUPIED":
            return HttpStatus.CONFLICT;

        case "LOBBY_NOT_JOINABLE":
            return HttpStatus.BAD_REQUEST;

        default:
            return HttpStatus.BAD_REQUEST;
    }
}

export function mapLobbyError(exception: LobbyError): LobbyErrorReponseBase {
    return {
        error: "LobbyError",
        code: exception.code,
        message: exception.message,
        timestamp: new Date().toISOString(),
    };
}
