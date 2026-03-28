import { Metadata } from "next";

import { TowersBanner } from "@/components/towers-banner";
import { makeMetaTitle } from "@/lib/util/meta-title";

import { LobbySwitch } from "./lobby-switch";

export const metadata: Metadata = {
    title: makeMetaTitle("Lobby"),
};

export default function LobbyPage() {
    return (
        <div className="m-auto flex flex-col items-center">
            <TowersBanner className="mb-10" />
            <LobbySwitch />
        </div>
    );
}
