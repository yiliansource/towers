import { type ArgumentsHost, Catch, type WsExceptionFilter } from "@nestjs/common";

import { LobbyError, type LobbyErrorWsResponse } from "@towers/shared/contracts";

import type { AuthSocket } from "@/auth/socket-auth.service";

import { mapLobbyError } from "./lobby-error.mapper";

@Catch(LobbyError)
export class LobbyWsExceptionFilter implements WsExceptionFilter {
    catch(exception: LobbyError, host: ArgumentsHost) {
        const ctx = host.switchToWs();

        ctx.getClient<AuthSocket>().emit("exception", {
            ...mapLobbyError(exception),
        } satisfies LobbyErrorWsResponse);
    }
}
