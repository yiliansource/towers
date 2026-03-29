import { Metadata } from "next";

import { makeMetaTitle } from "@/lib/util/meta-title";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
    title: makeMetaTitle("Register"),
};

export default function RegisterPage() {
    return <RegisterForm />;
}
