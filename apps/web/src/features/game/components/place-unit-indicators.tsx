import { StackedAxial, stringifyStackedAxial } from "@towers/shared/hexgrid";

import { useCursor } from "@react-three/drei";
import { useMemo, useState } from "react";

import { selectCurrentAction, selectCurrentActionStep } from "../store/game.selectors";
import { useGameStore } from "../store/game.store";
import { HexTileHighlight } from "./hex-highlighter";

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
    const setActionData = useGameStore((s) => s.setActionData);
    const advanceActionStep = useGameStore((s) => s.advanceActionStep);

    const [hovered, setHovered] = useState(false);
    useCursor(hovered, "pointer", "auto");

    const handleClick = () => {
        setActionData("selectedCoord", coord);
        advanceActionStep();
    };

    return (
        <group
            onClick={handleClick}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
            }}
            onPointerOut={() => setHovered(false)}
        >
            <HexTileHighlight coord={coord} color={"yellow"} />
        </group>
    );
}
