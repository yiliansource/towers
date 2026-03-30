import { Metadata } from "next";

import { makeMetaTitle } from "@/lib/util/meta-title";

import { LobbySwitch } from "./lobby-switch";

export const metadata: Metadata = {
    title: makeMetaTitle("Lobby"),
};

export default function LobbyPage() {
    return <LobbySwitch />;
}
