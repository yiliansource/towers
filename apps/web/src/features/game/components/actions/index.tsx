import { MoveUnitAction } from "./move-unit";
import { PlaceTowerAction } from "./place-tower";
import { PlaceUnitAction } from "./place-unit";

export function GameActions() {
    return (
        <>
            <PlaceTowerAction />
            <PlaceUnitAction />
            <MoveUnitAction />
        </>
    );
}
