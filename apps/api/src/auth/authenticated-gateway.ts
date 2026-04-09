import type { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import type { Socket } from "socket.io";

import type { AuthSocket, SocketAuthService } from "./socket-auth.service";

export abstract class AuthenticatedGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly socketAuthService: SocketAuthService) {}

    async handleConnection(client: Socket): Promise<void> {
        const user = await this.socketAuthService.authenticate(client);

        const authClient = client as AuthSocket;
        authClient.data.user = user;

        await this.onAuthenticatedConnect(authClient);
    }
    async handleDisconnect(client: Socket): Promise<void> {
        if ("user" in client.data) {
            await this.onAuthenticatedDisconnect(client as AuthSocket);
        }
    }

    protected abstract onAuthenticatedConnect(client: AuthSocket): Promise<void>;
    protected abstract onAuthenticatedDisconnect(client: AuthSocket): Promise<void>;
}
