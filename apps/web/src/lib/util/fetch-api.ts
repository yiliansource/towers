import { clientEnv } from "../env.client";

const API_URL = clientEnv.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchApi(path: string, init: RequestInit = {}): Promise<Response> {
    return fetch(`${API_URL}${path}`, {
        ...init,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(init.headers ?? {}),
        },
    });
}
