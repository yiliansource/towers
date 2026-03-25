import { z } from "zod";

export const ApiEnvSchema = z
    .object({
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
        PORT: z.coerce.number().int().positive().default(3001),

        JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
        JWT_EXPIRES_IN: z.string().default("7d"),

        DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

        CLIENT_ORIGIN: z.string(),
        COOKIE_DOMAIN: z.string().optional(),
    })
    .superRefine((env, ctx) => {
        if (env.NODE_ENV === "production" && !env.COOKIE_DOMAIN) {
            ctx.addIssue({
                code: "custom",
                path: ["COOKIE_DOMAIN"],
                message: "COOKIE_DOMAIN is required in production",
            });
        }
    });

export type ApiEnv = z.infer<typeof ApiEnvSchema>;
