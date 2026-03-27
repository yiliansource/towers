import { Injectable } from "@nestjs/common";

import { UserView } from "@towers/shared/contracts/auth";

import { ViewMapper } from "@/common/view-mapper";

export interface SimpleUser {
    id: string;
    username: string;
    socketId: string | null;
}

@Injectable()
export class UserMapper extends ViewMapper<SimpleUser, UserView> {
    toView(user: SimpleUser): Promise<UserView> {
        return Promise.resolve({
            id: user.id,
            username: user.username,
            connected: !!user.socketId,
        } satisfies UserView);
    }
}
