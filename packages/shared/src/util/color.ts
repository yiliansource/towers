import { SlotColor } from "@towers/shared/contracts";

export function getSlotColorValue(color: SlotColor | null): string {
    switch (color) {
        case SlotColor.GREEN:
            return "#1fb85c";
        case SlotColor.BLUE:
            return "#2b7fff";
        case SlotColor.PURPLE:
            return "#ad46ff";
        case SlotColor.PINK:
            return "#ff46af";
        case SlotColor.YELLOW:
            return "#dbb630";
        case SlotColor.ORANGE:
            return "#ff9346";
        case SlotColor.RED:
            return "#fb2c36";

        default:
            return "#b5b5b5";
    }
}
