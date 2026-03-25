import { Injectable } from "@nestjs/common";

import { UserView } from "@towers/shared";

import { ViewMapper } from "@/common/view-mapper";
import { User } from "@/generated/prisma/client";

@Injectable()
export class UserMapper extends ViewMapper<User, UserView> {
    toView(user: User): Promise<UserView> {
        return Promise.resolve({
            id: user.id,
            username: user.username,
            connected: user.connected, // TODO: maybe connected can be inferred from the socket ID not being null?
        } satisfies UserView);
    }
}
