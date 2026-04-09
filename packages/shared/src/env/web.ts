import { z } from "zod";

export const WebEnvSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    NEXT_PUBLIC_API_URL: z.string(),
});
