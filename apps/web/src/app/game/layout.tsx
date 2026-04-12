import { makeMetaTitle } from "@/common/util/meta-title";

import type { Metadata } from "next";

import GameProviders from "./providers";

export const metadata: Metadata = {
    title: makeMetaTitle("Game"),
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
    return <GameProviders>{children}</GameProviders>;
}
