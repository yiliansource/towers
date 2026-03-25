import { z } from "zod";

export const WebEnvSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string(),
    NEXT_PUBLIC_SOCKET_URL: z.string(),
});
