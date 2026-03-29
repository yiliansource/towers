import { z } from "zod";

const clientSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    NEXT_PUBLIC_API_URL: z.string(),
});

const parsed = clientSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

if (!parsed.success) {
    throw new Error("Invalid environment variables:\n" + z.treeifyError(parsed.error).errors.join("\n"));
}

export const clientEnv = parsed.data!;
