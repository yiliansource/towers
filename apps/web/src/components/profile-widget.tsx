"use client";

import { Button, Spinner } from "@radix-ui/themes";
import { LogOutIcon } from "lucide-react";
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
        <div className="inline-flex flex-row items-center gap-1">
            <p className="mb-1">{user.username}</p>
            <div>
                <button onClick={handleLogout} disabled={loggingOut} className="px-1 opacity-70 cursor-pointer">
                    {loggingOut ? <Spinner /> : <LogOutIcon className="size-4" />}
                </button>
            </div>
        </div>
    );
}
