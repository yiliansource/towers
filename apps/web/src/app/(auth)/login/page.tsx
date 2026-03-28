import { Metadata } from "next";

import { makeMetaTitle } from "@/lib/util/meta-title";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
    title: makeMetaTitle("Log in"),
};

export default function LoginPage() {
    return <LoginForm />;
}
