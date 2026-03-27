import { Metadata } from "next";

import { TowersBanner } from "@/components/towers-banner";
import { makeMetaTitle } from "@/lib/meta-title";

export const metadata: Metadata = {
    title: makeMetaTitle("Game"),
};

export default function GamePage() {
    return <div className="m-auto flex flex-col items-center"></div>;
}
