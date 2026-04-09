"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Flex, Spinner, Text, TextField } from "@radix-ui/themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { LoginInput, LoginInputSchema } from "@towers/shared/contracts";

import { FormError } from "@/common/ui/forms/FormError";
import { FormLabel } from "@/common/ui/forms/FormLabel";
import { createLogger } from "@/common/util/logger";
import { useAuthStore } from "@/features/auth/store/auth.store";

import { loginUser } from "../api/auth-actions";

const logger = createLogger("login-form");

export function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(LoginInputSchema),
    });

    const router = useRouter();
    const { setUser } = useAuthStore();

    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const onSubmit: SubmitHandler<LoginInput> = async (data) => {
        setIsLoggingIn(true);

        try {
            const user = await loginUser(data.username, data.password);
            if (user) {
                setUser(user);
                router.push("/lobby");
            }
        } catch (e) {
            if (e instanceof Error) {
                logger.error(e.message);
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
                        <TextField.Root {...register("username")} autoComplete="username" placeholder="TowersEnjoyer" />
                        <FormError className="mt-1">{errors.username?.message}</FormError>
                    </Box>
                    <Box>
                        <FormLabel>Password</FormLabel>
                        <TextField.Root
                            {...register("password")}
                            type="password"
                            autoComplete="current-password"
                            placeholder={"•".repeat(10)}
                        />
                        <FormError className="mt-1">{errors.password?.message}</FormError>
                    </Box>
                    <Button mt="4" type="submit" disabled={isLoggingIn}>
                        {isLoggingIn ? <Spinner /> : <span>Log in</span>}
                    </Button>
                </Flex>
            </form>
        </>
    );
}
