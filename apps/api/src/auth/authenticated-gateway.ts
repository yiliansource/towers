import { OnGatewayConnection } from "@nestjs/websockets";
import { Socket } from "socket.io";

import { AuthSocket, SocketAuthService } from "./socket-auth.service";

export abstract class AuthenticatedGateway implements OnGatewayConnection {
    constructor(private readonly socketAuthService: SocketAuthService) {}

    async handleConnection(client: Socket): Promise<void> {
        const user = await this.socketAuthService.authenticate(client);

        const authClient = client as AuthSocket;
        authClient.data.user = user;

        await this.onAuthenticatedConnection(authClient);
    }

    protected abstract onAuthenticatedConnection(client: AuthSocket): Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async handleDisconnect(client: Socket): Promise<void> {}
}
