"use client";

import { fetchApi } from "@/common/util/fetch-api";
import { sleep } from "@/common/util/promises";
import { useAuthStore } from "@/features/auth";

import { Spinner } from "@radix-ui/themes";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfileWidget() {
    const router = useRouter();

    const user = useAuthStore((s) => s.user);
    const clearUser = useAuthStore((s) => s.clearUser);

    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        await sleep(1000);

        const res = await fetchApi("/auth/logout", { method: "POST" });
        if (!res.ok) throw new Error("logout failed.");

        clearUser();
        setLoggingOut(false);

        router.push("/login");
    };

    return user === null ? null : (
        <div className="inline-flex flex-row items-center gap-1">
            <p className="mb-1">{user.username}</p>
            <div>
                <button
                    className="px-1 opacity-70 cursor-pointer"
                    disabled={loggingOut}
                    onClick={handleLogout}
                    type="button"
                >
                    {loggingOut ? <Spinner /> : <LogOutIcon className="size-4" />}
                </button>
            </div>
        </div>
    );
}
