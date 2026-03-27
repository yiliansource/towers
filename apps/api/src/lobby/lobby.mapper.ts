import { Injectable } from "@nestjs/common";

import { LobbyView } from "@towers/shared/contracts/lobby";

import { ViewMapper } from "@/common/view-mapper";
import { UserMapper } from "@/user/user.mapper";

import { LobbyWithRelations } from "./lobby.types";

@Injectable()
export class LobbyMapper extends ViewMapper<LobbyWithRelations, LobbyView> {
    constructor(private readonly userMapper: UserMapper) {
        super();
    }

    async toView(lobby: LobbyWithRelations): Promise<LobbyView> {
        return {
            id: lobby.id,
            publicId: lobby.publicId,
            state: lobby.state,
            host: await this.userMapper.toView(lobby.host),
            seats: await Promise.all(
                lobby.seats.map(async (s) => ({
                    user: s.user ? await this.userMapper.toView(s.user) : null,
                    slot: s.slot,
                })),
            ),
        };
    }
}
