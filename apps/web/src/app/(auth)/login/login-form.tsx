"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Flex, Spinner, Text, TextField } from "@radix-ui/themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { LoginInput, LoginInputSchema, UserView } from "@towers/shared/contracts/auth";

import { FormError } from "@/components/forms/FormError";
import { FormLabel } from "@/components/forms/FormLabel";
import { fetchApi } from "@/lib/fetch-api";
import { useAuthStore } from "@/stores/auth.store";

export function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(LoginInputSchema),
    });
    const [loginError, setLoginError] = useState<string | null>(null);

    const router = useRouter();
    const { setUser } = useAuthStore();

    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const onSubmit: SubmitHandler<LoginInput> = async (data) => {
        setIsLoggingIn(true);

        try {
            const res = await fetchApi("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    username: data.username,
                    password: data.password,
                } satisfies LoginInput),
            });
            if (!res.ok) {
                throw new Error("Invalid credentials.");
            }

            const user = (await res.json()) as UserView;
            setUser(user);

            router.push("/lobby");
        } catch (e) {
            if (e instanceof Error) {
                setLoginError(e.message);
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <>
            <Text mb="4" align="center">
                Please log in to your account or{" "}
                <Link className="text-(--accent-11) hover:underline" href="/register">
                    register
                </Link>{" "}
                to play.
            </Text>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Flex direction="column" gap="2">
                    <Box>
                        <FormLabel>Username</FormLabel>
                        <TextField.Root {...register("username")} placeholder="TowersEnjoyer" />
                        <FormError className="mt-1">{errors.username?.message}</FormError>
                    </Box>
                    <Box>
                        <FormLabel>Password</FormLabel>
                        <TextField.Root {...register("password")} type="password" placeholder={"•".repeat(10)} />
                        <FormError className="mt-1">{errors.password?.message}</FormError>
                    </Box>
                    {loginError && <FormError className="mt-1">{loginError}</FormError>}
                    <Button mt="4" type="submit" disabled={isLoggingIn}>
                        {isLoggingIn ? <Spinner /> : <span>Log in</span>}
                    </Button>
                </Flex>
            </form>
        </>
    );
}
