import { SpringValue, animated, useTransition } from "@react-spring/three";
import { easings } from "@react-spring/web";
import { Box, Cylinder, Line } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/Addons.js";

import { UnitType } from "@towers/shared/contracts/game";
import {
    STACKED_AXIAL_UP,
    StackedAxial,
    addStackedAxial,
    axial,
    axialRange,
    axialToStacked,
    equalStackedAxial,
    parseStackedAxial,
    stringifyStackedAxial,
} from "@towers/shared/hexgrid";

import { useGameInfo } from "@/lib/hooks/use-game-info";
import { useGameStore } from "@/lib/stores/game.store";
import { useLobbyStore } from "@/lib/stores/lobby.store";
import { stackedToWorld } from "@/lib/util/hex2three";
import { sleep } from "@/lib/util/sleep";

import { useHexGeometry } from "./hex-geometry";
import { PlacementPickSurface } from "./placement-pick-surface";

export function HexBoard() {
    const { game, ui } = useGameStore();
    const { isHostUser, isInTurn } = useGameInfo();

    if (!game) throw new Error();

    const gridPositions = useMemo(() => axialRange(axial(0, 0), 4).map((a) => axialToStacked(a, 0)), []);

    const pickablePositions = useMemo(() => {
        const candidates: StackedAxial[] = axialRange(axial(0, 0), 4).map((a) => axialToStacked(a, 0));
        for (const t of game.towers) {
            candidates.push(addStackedAxial(t, STACKED_AXIAL_UP));
        }

        const blockedPositions = game.towers.concat([game.king]);
        return candidates.filter((p) => !blockedPositions.some((t) => equalStackedAxial(t, p)));
    }, [game.towers]);

    return (
        <>
            <HexTileGrid positions={gridPositions} />

            {isInTurn && ui.hoveredHex && (!ui.selectedHex || !equalStackedAxial(ui.hoveredHex, ui.selectedHex)) && (
                <HexTileHighlight coord={ui.hoveredHex} color="yellow" />
            )}
            {isInTurn && ui.selectedHex && <HexTileHighlight coord={ui.selectedHex} color="green" />}

            {isInTurn &&
                pickablePositions.map((p) => <PlacementPickSurface key={stringifyStackedAxial(p)} coord={p} />)}

            <Towers coordList={game.towers} />
            <Units coordLookup={game.units} kingCoord={game.king} />
        </>
    );
}

function HexTileGrid({ positions }: { positions: StackedAxial[] }) {
    const transitions = useTransition(positions, {
        from: {
            opacity: 0,
        },
        enter: {
            opacity: 1,
        },
        leave: {
            opacity: 0,
        },
        config: { easing: easings.easeOutSine },
        delay: (i) => {
            const coord = i as unknown as StackedAxial;
            return (4 + coord.q + coord.r + coord.h) * 100;
        },
    });

    return (
        <>
            {transitions((style, item) => (
                <group key={stringifyStackedAxial(item)} position={stackedToWorld(item)}>
                    <HexTileOutline opacity={style.opacity} />
                </group>
            ))}
        </>
    );
}

const AnimatedLine = animated(Line);

function HexTileOutline({ opacity }: { opacity?: number | SpringValue<number> }) {
    const points = [...Array(7).keys()].map((i) => {
        const theta = ((i + 0.5) / 6) * (Math.PI * 2);
        return [Math.cos(theta), 0, Math.sin(theta)] as [number, number, number];
    });

    return <AnimatedLine points={points} color="#333" lineWidth={1} scale={opacity} transparent />;
}

function HexTileHighlight({ coord, color }: { coord: StackedAxial; color: string }) {
    const geometry = useHexGeometry();

    return (
        <group position={stackedToWorld(coord)}>
            <mesh geometry={geometry}>
                <meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false} />
            </mesh>
        </group>
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

function Tower() {
    const obj = useLoader(OBJLoader, "/tower.obj");
    const coloredObj = useMemo(() => {
        const clone = obj.clone();

        clone.scale.copy(new THREE.Vector3(1, 1, 1).multiplyScalar(0.72));
        clone.rotateY(30 * (Math.PI / 180));
        clone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;

                mesh.material = new THREE.MeshStandardMaterial({
                    color: "#d1a26d",
                });

                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });

        return clone;
    }, [obj]);

    return <primitive object={coloredObj} />;
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

function Knight({ playerId }: { playerId: string }) {
    const { lobby } = useLobbyStore();
    if (!lobby) throw new Error();

    const color = ["#00c950", "#fb2c36", "#2b7fff", "#ad46ff"][lobby.seats.findIndex((s) => s.user?.id === playerId)];
    const height = 0.8;
    return (
        <Cylinder position={[0, height / 2, 0]} args={[0.25, 0.35, height]} receiveShadow castShadow>
            <meshStandardMaterial color={color} />
        </Cylinder>
    );
}

function King() {
    const height = 1.2;
    return (
        <group>
            <Cylinder position={[0, height / 2, 0]} args={[0.3, 0.4, height]} receiveShadow castShadow>
                <meshStandardMaterial color="white" />
            </Cylinder>
            <Box position={[0, 1.5, 0]} args={[0.5, 0.15, 0.15]}>
                <meshStandardMaterial color="white" />
            </Box>
            <Box position={[0, 1.45, 0]} args={[0.15, 0.5, 0.15]}>
                <meshStandardMaterial color="white" />
            </Box>
        </group>
    );
}
