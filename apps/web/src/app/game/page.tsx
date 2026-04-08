import { Metadata } from "next";

import { TowersBanner } from "@/components/towers-banner";
import { makeMetaTitle } from "@/lib/util/meta-title";

import { GameSwitch } from "./game-switch";

export const metadata: Metadata = {
    title: makeMetaTitle("Game"),
};

export default function GamePage() {
    return (
        <div className="grow flex">
            <GameSwitch />
        </div>
    );
}
