"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Flex, Spinner, Text, TextField } from "@radix-ui/themes";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { LoginPayload, UserView } from "@towers/shared";

import { FormError } from "@/components/forms/FormError";
import { FormLabel } from "@/components/forms/FormLabel";
import { fetchApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

export const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const router = useRouter();
    const { setUser } = useAuthStore();

    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const onSubmit: SubmitHandler<LoginInput> = async (data) => {
        setIsLoggingIn(true);

        const res = await fetchApi("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                username: data.username,
                password: data.password,
            } satisfies LoginPayload),
        });
        if (!res.ok) return;

        const user = (await res.json()) as UserView;
        setUser(user);
        setIsLoggingIn(false);

        router.push("/lobby");
    };

    return (
        <>
            <Text mb="4" align="center">
                Please log in to your account or
                <br />
                <Link className="text-(--accent-11) hover:underline" href="/register">
                    register
                </Link>{" "}
                to play.
            </Text>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Flex mb="6" direction="column" gap="1">
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
                    <Button mt="5" type="submit" disabled={isLoggingIn}>
                        {isLoggingIn ? <Spinner /> : <span>Log in</span>}
                    </Button>
                </Flex>
            </form>
        </>
    );
}
