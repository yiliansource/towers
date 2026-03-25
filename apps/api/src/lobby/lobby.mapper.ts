import { Injectable } from "@nestjs/common";
import { ViewMapper } from "src/common/view-mapper";

import { LobbyView } from "@towers/shared";

import { Lobby } from "@/generated/prisma/client";
import { UserMapper } from "@/user/user.mapper";
import { UserService } from "@/user/user.service";

@Injectable()
export class LobbyMapper extends ViewMapper<Lobby, LobbyView> {
    constructor(
        private readonly userService: UserService,
        private readonly userMapper: UserMapper,
    ) {
        super();
    }

    async toView(lobby: Lobby): Promise<LobbyView> {
        const users = await this.userService.users({ activeLobbyId: lobby.id });
        const userViews = await this.userMapper.toViews(users);

        return {
            id: lobby.id,
            publicId: lobby.publicId,
            hostUserId: lobby.hostUserId,
            state: lobby.state,
            users: userViews,
        };
    }
}
