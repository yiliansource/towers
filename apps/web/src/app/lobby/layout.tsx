import type { Metadata } from "next";

import { makeMetaTitle } from "@/common/util/meta-title";

import LobbyProviders from "./providers";

export const metadata: Metadata = {
    title: makeMetaTitle("Lobby"),
};

export default function LobbyLayout({ children }: { children: React.ReactNode }) {
    return <LobbyProviders>{children}</LobbyProviders>;
}
