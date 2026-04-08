export type Axial = Readonly<{
    q: number;
    r: number;
}>;
export type StackedAxial = Readonly<
    Axial & {
        h: number;
    }
>;
export type Cube = Readonly<
    Axial & {
        s: number;
    }
>;

export type HexDirection = 0 | 1 | 2 | 3 | 4 | 5;
