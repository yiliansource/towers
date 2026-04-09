import type { Request } from "express";

import type { User } from "@/generated/prisma/client";

export type RequestWithUser = Request & {
    user?: User;
};
