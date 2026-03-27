import { Prisma } from "@/generated/prisma/client";

export type LobbyWithRelations = Prisma.LobbyGetPayload<{
    include: {
        host: {
            select: {
                id: true;
                username: true;
                socketId: true;
            };
        };
        seats: {
            orderBy: { slot: "asc" };
            include: {
                user: {
                    select: {
                        id: true;
                        username: true;
                        socketId: true;
                    };
                };
            };
        };
    };
}>;
