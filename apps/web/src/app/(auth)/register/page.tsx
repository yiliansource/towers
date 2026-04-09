import type { Metadata } from "next";

import { TowersBanner } from "@/common/ui/towers-banner";
import { makeMetaTitle } from "@/common/util/meta-title";
import { RegisterForm } from "@/features/auth";

export const metadata: Metadata = {
    title: makeMetaTitle("Register"),
};

export default function RegisterPage() {
    return (
        <div className="m-auto flex flex-col items-center">
            <TowersBanner className="mb-2" />
            <div className="flex flex-col w-60">
                <RegisterForm />
            </div>
        </div>
    );
}
