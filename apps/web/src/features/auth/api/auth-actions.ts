import type {
    AuthErrorHttpResponse,
    LoginInput,
    RegisterInput,
    UserView,
} from "@towers/shared/contracts";
import toast from "react-hot-toast";

import { fetchApi } from "@/common/util/fetch-api";

export async function getUser(): Promise<UserView | null> {
    const res = await fetchApi("/auth/me");
    if (!res.ok) return null;

    return (await res.json()) as UserView;
}

export async function registerUser(username: string, password: string): Promise<UserView | null> {
    const res = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({
            username,
            password,
        } satisfies RegisterInput),
    });
    if (!res.ok) {
        const error = (await res.json()) as AuthErrorHttpResponse;

        toast.error(error.code);
        return null;
    }

    return (await res.json()) as UserView;
}

export async function loginUser(username: string, password: string): Promise<UserView | null> {
    const res = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            username: username,
            password: password,
        } satisfies LoginInput),
    });
    if (!res.ok) {
        const error = (await res.json()) as AuthErrorHttpResponse;

        toast.error(error.code);
        return null;
    }

    return (await res.json()) as UserView;
}
