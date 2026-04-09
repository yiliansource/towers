import { Metadata } from "next";

import { makeMetaTitle } from "@/common/util/meta-title";

export const metadata: Metadata = {
    title: makeMetaTitle("Game"),
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return children;
}
