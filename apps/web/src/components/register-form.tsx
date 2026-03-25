import { useEffect, useState } from "react";

import { RegisterPayload, UserView } from "@towers/shared";

import { fetchApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

import { Button } from "./button";

export function RegisterForm() {
    const [usernamePlaceholder, setUsernamePlaceholder] = useState<string>("");
    const [usernameInput, setUsernameInput] = useState<string>("");

    useEffect(() => {
        const firstList = ["Towers", "Castle", "Wall", "Building", "Structure"];
        const secondList = ["Enjoyer", "Enthusiast", "Liker", "Lover", "Obsessor"];

        const first = firstList[Math.floor(Math.random() * firstList.length)];
        const second = secondList[Math.floor(Math.random() * secondList.length)];
        const third = Math.floor(Math.random() * 90) + 10;

        setUsernamePlaceholder([first, second, third].join(""));
    }, []);

    const handleUsernameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsernameInput(e.target.value);
    };
    const handleRegister = () => {
        void (async function () {
            const res = await fetchApi("/auth/register", {
                method: "POST",
                body: JSON.stringify({ username: usernameInput } satisfies RegisterPayload),
            });

            if (!res.ok) {
                throw new Error("Register failed");
            }

            const user = (await res.json()) as UserView;
            useAuthStore.getState().setUser(user);
        })();
    };

    return (
        <div key="register" className="flex flex-col">
            <p className="mb-2 font-bold">what would you like to be called?</p>
            <div className="mb-4 flex flex-row items-center gap-1">
                <label className="">username:</label>
                <input
                    className="px-1"
                    placeholder={usernamePlaceholder}
                    value={usernameInput}
                    onChange={handleUsernameInputChange}
                />
            </div>
            <Button className="mr-auto" onClick={handleRegister}>
                continue
            </Button>
        </div>
    );
}
