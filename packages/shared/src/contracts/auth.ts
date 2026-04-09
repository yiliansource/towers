import { z } from "zod";

export const AuthErrorCode = {
    VALIDATION_ERROR: "VALIDATION_ERROR",
    USERNAME_EXISTS: "USERNAME_EXISTS",
    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
} as const;
export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

export class AuthError extends Error {
    constructor(
        public readonly code: AuthErrorCode,
        message?: string,
    ) {
        super(message ?? code);
        this.name = "AuthError";
    }
}

export interface AuthErrorHttpResponse {
    error: "AuthError";
    code: string;
    message: string;
    timestamp: string;
    statusCode: number;
    path: string;
}

export const UsernameSchema = z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username must be at most 20 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores");

export const PasswordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be at most 72 characters.");

export const RegisterInputSchema = z.object({
    username: UsernameSchema,
    password: PasswordSchema,
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const RegisterFormSchema = RegisterInputSchema.extend({
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
});

export type RegisterFormInput = z.infer<typeof RegisterFormSchema>;

export const LoginInputSchema = z.object({
    username: z.string(),
    password: z.string(),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

export const UserViewSchema = z.object({
    id: z.string(),
    username: z.string(),
    connected: z.boolean(),
});

export type UserView = z.infer<typeof UserViewSchema>;
