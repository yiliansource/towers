"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Flex, Spinner, Text, TextField } from "@radix-ui/themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { LoginPayload, UserView } from "@towers/shared";

import { FormError } from "@/components/forms/FormError";
import { FormLabel } from "@/components/forms/FormLabel";
import { fetchApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

export const registerSchema = z
    .object({
        username: z
            .string()
            .min(3, { error: "Must be 3 characters at least." })
            .max(20, { error: "Must be 20 characters at most." }),
        password: z.string().min(6, { error: "Must be 6 characters at least." }).max(72),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

export type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });
    const [registerError, setRegisterError] = useState<string | null>(null);

    const router = useRouter();
    const { setUser } = useAuthStore();

    const [isRegistering, setIsRegistering] = useState(false);

    const onSubmit: SubmitHandler<RegisterInput> = async (data) => {
        setIsRegistering(true);

        try {
            const res = await fetchApi("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    username: data.username,
                    password: data.password,
                } satisfies LoginPayload),
            });
            if (!res.ok) {
                throw new Error("An error occurred during the registration.");
            }

            const user = (await res.json()) as UserView;
            setUser(user);

            router.push("/lobby");
        } catch (e) {
            if (e instanceof Error) {
                setRegisterError(e.message);
            }
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <>
            <Text mb="4" align="center">
                Please create an account or{" "}
                <Link className="text-(--accent-11) hover:underline" href="/login">
                    log in
                </Link>{" "}
                to play.
            </Text>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Flex direction="column" gap="2">
                    <Box>
                        <FormLabel>Username</FormLabel>
                        <TextField.Root {...register("username")} autoComplete="off" placeholder="TowersEnjoyer" />
                        <FormError className="mt-1">{errors.username?.message}</FormError>
                    </Box>
                    <Box>
                        <FormLabel>Password</FormLabel>
                        <TextField.Root
                            {...register("password")}
                            autoComplete="new-password"
                            type="password"
                            placeholder={"•".repeat(10)}
                        />
                        <FormError className="mt-1">{errors.password?.message}</FormError>
                    </Box>
                    <Box>
                        <FormLabel>Confirm password</FormLabel>
                        <TextField.Root {...register("confirmPassword")} type="password" placeholder={"•".repeat(10)} />
                        <FormError className="mt-1">{errors.confirmPassword?.message}</FormError>
                    </Box>
                    {registerError && <FormError className="mt-1">{registerError}</FormError>}
                    <Button mt="4" type="submit" disabled={isRegistering}>
                        {isRegistering ? <Spinner /> : <span>Register</span>}
                    </Button>
                </Flex>
            </form>
        </>
    );
}
