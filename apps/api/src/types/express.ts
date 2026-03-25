import { Request } from "express";

import { User } from "@/generated/prisma/client";

export type RequestWithUser = Request & {
    user?: User;
};
