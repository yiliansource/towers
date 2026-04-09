export const SlotColor = {
    GREEN: "GREEN",
    BLUE: "BLUE",
    PURPLE: "PURPLE",
    PINK: "PINK",
    YELLOW: "YELLOW",
    ORANGE: "ORANGE",
    RED: "RED",
} as const;
export type SlotColor = (typeof SlotColor)[keyof typeof SlotColor];
