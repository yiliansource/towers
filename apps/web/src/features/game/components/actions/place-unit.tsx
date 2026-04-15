import { StackedAxial, stringifyStackedAxial } from "@towers/shared/hexgrid";

import { stackedToWorld } from "@/common/util/hex2three";
import { useAuthStore } from "@/features/auth";

import { Html, useCursor } from "@react-three/drei";
import { ArrowBigDownDashIcon, CheckIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { useGameCommands } from "../../realtime/use-game-commands";
import { selectCurrentAction, selectCurrentActionStep } from "../../store/game.selectors";
import { useGameStore } from "../../store/game.store";
import { ClickableHex } from "../clickable-hex";
import { KnightModel } from "../models/knight";

export function PlaceUnitAction() {
    return (
        <>
            <PlaceUnitIndicators />
            <PlaceUnitConfirm />
        </>
    );
}

export function PlaceUnitConfirm() {
    const actionState = useGameStore((s) => s.actionState);
    const action = useGameStore(selectCurrentAction);
    const actionStep = useGameStore(selectCurrentActionStep);
    const decreaseActionStep = useGameStore((s) => s.decreaseActionStep);
    const { submitAction } = useGameCommands();
    const user = useAuthStore((s) => s.user!);

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
            <group position={stackedToWorld(highlightedHex)}>
                <KnightModel playerId={user.id} ghost={true} />
                <group position={[0, 1, 0]}>
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

export function PlaceUnitIndicators() {
    const action = useGameStore(selectCurrentAction);
    const actionStep = useGameStore(selectCurrentActionStep);

    const highlightedHexes = useMemo(() => {
        if (!action || !actionStep) return [];
        if (actionStep === "selectHex") {
            if (action.name === "placeUnit") return action.availableCoords ?? [];
        }
        return [];
    }, [action, actionStep]);

    return (
        <group>
            {highlightedHexes.map((coord) => (
                <PlaceUnitIndicator key={stringifyStackedAxial(coord)} coord={coord} />
            ))}
        </group>
    );
}

export function PlaceUnitIndicator({ coord }: { coord: StackedAxial }) {
    const user = useAuthStore((s) => s.user!);

    const setActionData = useGameStore((s) => s.setActionData);
    const advanceActionStep = useGameStore((s) => s.advanceActionStep);

    const [hovered, setHovered] = useState(false);
    useCursor(hovered, "pointer", "auto");

    const handleClick = () => {
        setActionData("selectedCoord", coord);
        advanceActionStep();
    };

    return (
        <group position={stackedToWorld(coord)}>
            <ClickableHex onClick={handleClick} onHoverChanged={setHovered} />
            {hovered && <KnightModel playerId={user.id} ghost={true} />}
            {!hovered && (
                <Html position={[0, 0.5, 0]} center>
                    <ArrowBigDownDashIcon className="text-green-400 size-7 drop-shadow-sm" />
                </Html>
            )}
        </group>
    );
}
