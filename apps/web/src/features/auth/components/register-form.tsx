"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Flex, Spinner, Text, TextField } from "@radix-ui/themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { RegisterFormInput, RegisterFormSchema, RegisterInput, UserView } from "@towers/shared/contracts";

import { FormError } from "@/common/ui/forms/FormError";
import { FormLabel } from "@/common/ui/forms/FormLabel";
import { fetchApi } from "@/common/util/fetch-api";
import { createLogger } from "@/common/util/logger";
import { useAuthStore } from "@/features/auth/store/auth.store";

import { registerUser } from "../api/auth-actions";

const logger = createLogger("register-form");

export function RegisterForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormInput>({
        resolver: zodResolver(RegisterFormSchema),
    });

    const router = useRouter();
    const { setUser } = useAuthStore();

    const [isRegistering, setIsRegistering] = useState(false);

    const onSubmit: SubmitHandler<RegisterFormInput> = async (data) => {
        setIsRegistering(true);

        try {
            const user = await registerUser(data.username, data.password);
            if (user) {
                setUser(user);
                router.push("/lobby");
            }
        } catch (e) {
            if (e instanceof Error) {
                logger.error(e.message);
            }
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <>
            <title>Page title</title>

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
                        <TextField.Root
                            {...register("confirmPassword")}
                            type="password"
                            autoComplete="new-password"
                            placeholder={"•".repeat(10)}
                        />
                        <FormError className="mt-1">{errors.confirmPassword?.message}</FormError>
                    </Box>
                    <Button mt="4" type="submit" disabled={isRegistering}>
                        {isRegistering ? <Spinner /> : <span>Register</span>}
                    </Button>
                </Flex>
            </form>
        </>
    );
}
