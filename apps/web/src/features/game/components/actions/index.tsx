import { PlaceTowerConfirm, PlaceTowerIndicators } from "./place-tower";
import { PlaceUnitConfirm, PlaceUnitIndicators } from "./place-unit";

export function GameActions() {
    return (
        <>
            <PlaceUnitIndicators />
            <PlaceUnitConfirm />

            <PlaceTowerIndicators />
            <PlaceTowerConfirm />
        </>
    );
}
