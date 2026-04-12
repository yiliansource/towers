import type { User } from "@/generated/prisma/client";

import type { Request } from "express";

export type RequestWithUser = Request & {
    user?: User;
};
