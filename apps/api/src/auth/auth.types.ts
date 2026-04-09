import type { User } from "@/generated/prisma/client";

export interface AuthJwtPayload {
    sub: string;
    name: string;
}

export type AuthSocketData = {
    user: User;
};
