"use client";

import { Button, Spinner } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { fetchApi } from "@/lib/api";
import { sleep } from "@/lib/sleep";
import { useAuthStore } from "@/stores/auth.store";

export function ProfileWidget() {
    const router = useRouter();
    const { user, logoutLocal } = useAuthStore();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        await sleep(1000);

        const res = await fetchApi("/auth/logout", { method: "POST" });
        if (!res.ok) throw new Error("logout failed.");

        logoutLocal();
        setLoggingOut(false);

        router.push("/login");
    };

    return user === null ? null : (
        <div className="flex flex-col items-end">
            <p className="mb-1">
                hello, <span className="">{user.username}</span>
            </p>
            <div>
                <Button onClick={handleLogout} disabled={loggingOut}>
                    {loggingOut ? <Spinner /> : <span>Log out</span>}
                </Button>
            </div>
        </div>
    );
}
