import { StackedAxial } from "@towers/shared/hexgrid";

import { stackedToWorld } from "@/common/util/hex2three";

import { Html } from "@react-three/drei";
import { CheckIcon, XIcon } from "lucide-react";
import { useMemo } from "react";
import * as THREE from "three";

import { useGameCommands } from "../realtime/use-game-commands";
import { selectCurrentAction, selectCurrentActionStep } from "../store/game.selectors";
import { useGameStore } from "../store/game.store";
import { HexTileHighlight } from "./hex-highlighter";

export function PlaceUnitConfirm() {
    const actionState = useGameStore((s) => s.actionState);
    const action = useGameStore(selectCurrentAction);
    const actionStep = useGameStore(selectCurrentActionStep);
    const decreaseActionStep = useGameStore((s) => s.decreaseActionStep);
    const { submitAction } = useGameCommands();

    const handleConfirm = () => {
        if (!actionState || !action || !actionStep) return null;
        if (action.name !== "placeUnit" || actionStep !== "confirm") return null;

        const coord = actionState.data.selectedCoord as StackedAxial;
        submitAction({
            name: "placeUnit",
            coord,
            unit: "KNIGHT",
        });
    };

    const highlightedHex = useMemo(() => {
        if (!actionState || !action || !actionStep) return null;
        if (action.name !== "placeUnit" || actionStep !== "confirm") return null;

        return actionState.data.selectedCoord as StackedAxial;
    }, [actionState, action, actionStep]);

    return (
        highlightedHex && (
            <group>
                <HexTileHighlight coord={highlightedHex} color={"yellow"} />
                <group position={stackedToWorld(highlightedHex).add(new THREE.Vector3(0, 1, 0))}>
                    <Html center className="flex flex-row gap-2">
                        <div
                            className="p-2 text-red-500 bg-neutral-800/90 hover:bg-red-200/90"
                            onClick={() => void decreaseActionStep()}
                        >
                            <XIcon />
                        </div>
                        <div
                            className="p-2 text-green-500 bg-neutral-800/90 hover:bg-green-200/90"
                            onClick={() => void handleConfirm()}
                        >
                            <CheckIcon />
                        </div>
                    </Html>
                </group>
            </group>
        )
    );
}
