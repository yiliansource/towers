"use client";

import { ViewTransition } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
    return <ViewTransition default="fade">{children}</ViewTransition>;
}
