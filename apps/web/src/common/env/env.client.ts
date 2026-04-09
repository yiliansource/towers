import { z } from "zod";

import { WebEnvSchema } from "@towers/shared/env/web";

const parsed = WebEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

if (!parsed.success) {
    throw new Error("Invalid environment variables:\n" + z.treeifyError(parsed.error).errors.join("\n"));
}

export const clientEnv = parsed.data!;
