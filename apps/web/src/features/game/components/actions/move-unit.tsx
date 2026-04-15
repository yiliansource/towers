import {
    dijkstra,
    equalStackedAxial,
    getGroundCoordinates,
    getPathFromDijkstra,
    StackedAxial,
    stackedAxialLength,
    stringifyStackedAxial,
    subStackedAxial,
} from "@towers/shared/hexgrid";

import { HEX_HEIGHT, stackedToWorld } from "@/common/util/hex2three";

import { Circle, CubicBezierLine, Html, Line, Sphere } from "@react-three/drei";
import { CheckIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

import { useGameCommands } from "../../realtime/use-game-commands";
import { selectCurrentAction, selectCurrentActionStep } from "../../store/game.selectors";
import { useGameStore } from "../../store/game.store";
import { usePlayerResources } from "../../store/use-game-derived";

export function MoveUnitAction() {
    return (
        <>
            <MoveUnitConfirm />
            <MoveUnitIndicator />
        </>
    );
}

export function MoveUnitConfirm() {
    const actionState = useGameStore((s) => s.actionState);
    const boardState = useGameStore((s) => s.boardState);
    const action = useGameStore(selectCurrentAction);
    const actionStep = useGameStore(selectCurrentActionStep);
    const decreaseActionStep = useGameStore((s) => s.decreaseActionStep);
    const clearAction = useGameStore((s) => s.clearAction);
    const { submitAction } = useGameCommands();

    const selectedUnit = actionState?.data.selectedUnit as StackedAxial | undefined;
    const selectedCoord = actionState?.data.selectedCoord as StackedAxial | undefined;

    const handleConfirm = () => {
        if (!actionState || !action || !actionStep) return;
        if (action.name !== "moveUnit" || actionStep !== "confirm") return;
        if (!selectedUnit || !selectedCoord) return;

        submitAction({
            name: "moveUnit",
            unit: actionState.data.selectedUnit as StackedAxial,
            coord: actionState.data.selectedCoord as StackedAxial,
        });
    };
    const handleCancel = () => {
        if (!actionState || !action || !actionStep) return;

        if (actionState.data.wasStartedByDrag as boolean | undefined) {
            void clearAction();
        } else {
            void decreaseActionStep();
        }
    };

    const view = useMemo(() => {
        if (!actionState || !action || !actionStep) return null;
        if (action.name !== "moveUnit" || actionStep !== "confirm") return null;
        if (!boardState || !selectedUnit || !selectedCoord) return null;

        const dijkstraRes = dijkstra(
            getGroundCoordinates(boardState.towers, 4),
            boardState.towers,
            Object.values(boardState.units).flat().concat(boardState.king),
            selectedUnit,
        );

        const path = getPathFromDijkstra(selectedCoord, dijkstraRes.ancestorMap);
        return {
            path,
            pathCosts: path?.map((n) => dijkstraRes.distanceMap.get(stringifyStackedAxial(n))),
        };
    }, [actionState, action, actionStep, boardState, selectedUnit, selectedCoord]);

    return (
        view?.path &&
        selectedUnit &&
        selectedCoord && (
            <group>
                <group position={stackedToWorld(selectedCoord)}>
                    <group position={[0, 1, 0]}>
                        <Html center className="flex flex-row gap-2">
                            <div
                                className="p-2 text-red-500 bg-neutral-800/90 hover:bg-red-200/90"
                                onClick={() => void handleCancel()}
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
                {
                    <PathCurve
                        nodes={view.path}
                        labels={view.pathCosts?.map((c, i, a) =>
                            i === 0 || a[i - 1] === a[i] ? null : String(c),
                        )}
                    />
                }
            </group>
        )
    );
}

export function MoveUnitIndicator() {
    const gameUi = useGameStore((s) => s.ui);
    const boardState = useGameStore((s) => s.boardState);

    const action = useGameStore(selectCurrentAction);
    const actionStep = useGameStore(selectCurrentActionStep);
    const actionState = useGameStore((s) => s.actionState);

    const resources = usePlayerResources();

    const setActionData = useGameStore((s) => s.setActionData);
    const advanceActionStep = useGameStore((s) => s.advanceActionStep);

    const [hoveredHex, setHoveredHex] = useState<StackedAxial | null>();

    const selectedUnit = (actionState?.data.selectedUnit as StackedAxial) ?? null;

    useEffect(() => {
        setHoveredHex(selectedUnit);
    }, [selectedUnit]);

    const groundCoordinates = useMemo(() => {
        if (!boardState) return [];
        return getGroundCoordinates(boardState.towers, 4);
    }, [boardState]);

    const view = useMemo(() => {
        if (!selectedUnit || !hoveredHex || !boardState) return null;

        const dijkstraRes = dijkstra(
            groundCoordinates,
            boardState.towers,
            Object.values(boardState.units).flat().concat(boardState.king),
            selectedUnit,
            resources!.actionPoints,
        );

        const path = getPathFromDijkstra(hoveredHex, dijkstraRes.ancestorMap);
        return {
            path,
            pathCosts: path?.map((n) => dijkstraRes.distanceMap.get(stringifyStackedAxial(n))),
        };
    }, [selectedUnit, groundCoordinates, boardState, resources, hoveredHex]);

    const handleClick = () => {
        if (!view?.path) return;
        console.log("blah", view.path);

        setActionData("selectedCoord", hoveredHex);
        advanceActionStep();
    };

    if (!action || action.name !== "moveUnit" || actionStep !== "selectHex") {
        return null;
    }

    return (
        <group>
            {groundCoordinates.map((c) => (
                <group
                    key={stringifyStackedAxial(c)}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        if (hoveredHex && equalStackedAxial(c, hoveredHex)) {
                            handleClick();
                        }
                    }}
                    onPointerMove={(e) => {
                        e.stopPropagation();
                        setHoveredHex(c);
                    }}
                    onPointerLeave={(e) => {
                        e.stopPropagation();
                        if (hoveredHex && equalStackedAxial(c, hoveredHex)) {
                            // setHoveredHex(null);
                        }
                    }}
                    onPointerUp={(e) => {
                        e.stopPropagation();
                        if (gameUi.draggingHex && hoveredHex && equalStackedAxial(c, hoveredHex)) {
                            handleClick();
                        }
                    }}
                    position={stackedToWorld(c)}
                >
                    <Circle
                        args={[1, 6]}
                        scale={0.99}
                        position={[0, 0.05, 0]}
                        rotation={[-Math.PI / 2, 0, Math.PI / 6]}
                    >
                        <meshBasicMaterial color="white" transparent opacity={0} />
                    </Circle>
                </group>
            ))}

            {view && (
                <group>
                    {/* {view.pathCosts && hoveredHex && Number.isFinite(view.pathCosts) && (
                        <group position={stackedToWorld(hoveredHex)}>
                            <Html center className="pointer-events-none">
                                <div className="flex flex-row gap-2 -translate-y-8">
                                    <RedoIcon />
                                    <p className="text-2xl font-bold text-shadow-md">
                                        {view.pathCosts}
                                    </p>
                                </div>
                            </Html>
                        </group>
                    )} */}

                    {view.path && view.path.length > 0 && (
                        <PathCurve
                            nodes={view.path}
                            labels={view.pathCosts?.map((c, i, a) =>
                                i === 0 || a[i - 1] === a[i] ? null : String(c),
                            )}
                        />
                    )}
                    {hoveredHex && <TileIndicator coord={hoveredHex} valid={!!view.path} />}

                    {/* <PathCurveSegment a={stackedAxial(-2, 0, 0)} b={stackedAxial(-1, -1, 0)} /> */}
                </group>
            )}
        </group>
    );
}

function TileIndicator({ coord, valid = true }: { coord: StackedAxial; valid?: boolean }) {
    const radius = 0.3;
    const segments = 32;
    const points = useMemo(() => {
        const pts: THREE.Vector3[] = [];

        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, 0));
        }

        return pts;
    }, []);

    return (
        <group position={stackedToWorld(coord)}>
            <Line
                rotation={[Math.PI / 2, 0, 0]}
                position={[0, 0.1, 0]}
                points={points}
                lineWidth={5}
                color={valid ? "green" : "red"}
                raycast={() => {}}
            />
        </group>
    );
}

function PathCurve({ nodes, labels }: { nodes: StackedAxial[]; labels?: (string | null)[] }) {
    const pairs = useMemo(() => {
        if (nodes.length < 2) return [];
        return [...Array(nodes.length - 1).keys()].map(
            (i) => [nodes[i], nodes[i + 1]] as [StackedAxial, StackedAxial],
        );
    }, [nodes]);

    return (
        <group>
            {pairs.map(([a, b]) => (
                <PathCurveSegment
                    key={`${stringifyStackedAxial(a)}-${stringifyStackedAxial(b)}`}
                    a={a}
                    b={b}
                />
            ))}
            {labels?.map(
                (l, i) =>
                    l && (
                        // biome-ignore lint/suspicious/noArrayIndexKey: easiest
                        <group key={i} position={stackedToWorld(nodes[i])}>
                            <group position={[0, 0.1, 0]}>
                                <Sphere args={[0.15]}>
                                    <meshBasicMaterial color="green" />
                                </Sphere>
                                <Html center className="pointer-events-none">
                                    <p className="text-sm font-bold">{l}</p>
                                </Html>
                            </group>
                        </group>
                    ),
            )}
        </group>
    );
}

function PathCurveSegment({ a, b }: { a: StackedAxial; b: StackedAxial }) {
    const delta = subStackedAxial(b, a);
    const distance = stackedAxialLength(delta);
    const theta = Math.atan2(-(3 / 2) * delta.r, Math.sqrt(3) * (delta.q + delta.r / 2));

    let contents: React.ReactNode | null = null;

    const lineWidth = 5;

    if (delta.h === 0) {
        const t = 0.6;
        const h = 0.15;
        contents = (
            <CubicBezierLine
                start={[0, 0, 0]}
                midA={[t, h, 0]}
                midB={[Math.sqrt(3) - t, h, 0]}
                end={[Math.sqrt(3), 0, 0]}
                lineWidth={lineWidth}
                color="green"
            />
        );
    } else if (delta.h === 1 && distance === 2) {
        const t = 0.3;
        contents = (
            <CubicBezierLine
                start={[0, 0, 0]}
                midA={[t, HEX_HEIGHT * 2, 0]}
                midB={[Math.sqrt(3) - t, HEX_HEIGHT * 2, 0]}
                end={[Math.sqrt(3), HEX_HEIGHT, 0]}
                lineWidth={lineWidth}
                color="green"
            />
        );
    } else if (delta.h < 0 && distance === -delta.h + 1) {
        const t = 0.3;
        contents = (
            <CubicBezierLine
                start={[0, 0, 0]}
                midA={[t, 0, 0]}
                midB={[Math.sqrt(3) - t, HEX_HEIGHT, 0]}
                end={[Math.sqrt(3), HEX_HEIGHT * delta.h, 0]}
                lineWidth={lineWidth}
                color="green"
            />
        );
    }

    const worldPos = stackedToWorld(a).add({ x: 0, y: 0.1, z: 0 });

    return (
        <group position={worldPos} rotation={[0, theta, 0]}>
            {contents}
        </group>
    );
}
