import { animated, useTransition } from "@react-spring/three";
import { useEffect, useMemo, useState } from "react";

import {
    StackedAxial,
    axial,
    axialRange,
    axialToStacked,
    parseStackedAxial,
    stringifyStackedAxial,
} from "@towers/shared/hexgrid";

import { stackedToWorld } from "@/common/util/hex2three";
import { sleep } from "@/common/util/sleep";

import { useGameStore } from "../store/game.store";
import { HexGrid } from "./hex-grid";
import { King } from "./models/king";
import { Knight } from "./models/knight";
import { Tower } from "./models/tower";

export function GameBoard() {
    const game = useGameStore((s) => s.game!);

    const gridPositions = useMemo(() => axialRange(axial(0, 0), 4).map((a) => axialToStacked(a, 0)), []);

    return (
        <>
            <HexGrid positions={gridPositions} />
            <Towers coordList={game.towers} />
            <Units coordLookup={game.units} kingCoord={game.king} />
        </>
    );
}

function Towers({ coordList }: { coordList: StackedAxial[] }) {
    const [initial, setInitial] = useState(true);

    const transitions = useTransition(coordList, {
        from: {
            scale: [0, 0, 0] as [number, number, number],
            position: [0, -1, 0] as [number, number, number],
        },
        enter: {
            scale: [1, 1, 1] as [number, number, number],
            position: [0, 0, 0] as [number, number, number],
        },
        leave: {
            scale: [0, 0, 0] as [number, number, number],
            position: [0, 1, 0] as [number, number, number],
        },
        config: { tension: 170, friction: 20 },
        delay: (i) => {
            const coord = parseStackedAxial(i);
            return initial ? (4 + coord.q + coord.r + coord.h) * 100 : 0;
        },
        keys: (i) => stringifyStackedAxial(i),
    });

    useEffect(() => {
        sleep(1000).then(() => setInitial(false));
    }, []);

    return (
        <>
            {transitions((style, item) => (
                <group key={stringifyStackedAxial(item)} position={stackedToWorld(item)}>
                    <animated.group position={style.position} scale={style.scale}>
                        <Tower />
                    </animated.group>
                </group>
            ))}
        </>
    );
}

type UnitTransitionItem =
    | {
          unit: "KNIGHT";
          pid: string;
          coord: StackedAxial;
      }
    | {
          unit: "KING";
          coord: StackedAxial;
      };

function Units({
    coordLookup,
    kingCoord,
}: {
    coordLookup: Record<string, StackedAxial[]>;
    kingCoord: StackedAxial | null;
}) {
    const [initial, setInitial] = useState(true);

    const items: UnitTransitionItem[] = [
        ...Object.entries(coordLookup).flatMap(([pid, coords]) =>
            coords.map((c) => ({ unit: "KNIGHT", pid, coord: c }) satisfies UnitTransitionItem),
        ),
    ];
    if (kingCoord) {
        items.push({
            unit: "KING",
            coord: kingCoord,
        });
    }

    const transitions = useTransition(items, {
        from: {
            scale: [0, 0, 0] as [number, number, number],
            position: [0, -1, 0] as [number, number, number],
        },
        enter: {
            scale: [1, 1, 1] as [number, number, number],
            position: [0, 0, 0] as [number, number, number],
        },
        leave: {
            scale: [0, 0, 0] as [number, number, number],
            position: [0, 1, 0] as [number, number, number],
        },
        config: { tension: 170, friction: 20 },
        delay: (i) => {
            const coord = parseStackedAxial(i.split("-")[1]);
            return initial ? (4 + coord.q + coord.r + coord.h) * 100 : 0;
        },
        keys: (i) => {
            return i.unit + "-" + stringifyStackedAxial(i.coord);
        },
    });

    useEffect(() => {
        sleep(1000).then(() => setInitial(false));
    }, []);

    return (
        <>
            {transitions((style, item, state) => (
                <group key={state.key} position={stackedToWorld(item.coord)}>
                    <animated.group position={style.position} scale={style.scale}>
                        {item.unit === "KNIGHT" && <Knight playerId={item.pid} />}
                        {item.unit === "KING" && <King />}
                    </animated.group>
                </group>
            ))}
        </>
    );
}
