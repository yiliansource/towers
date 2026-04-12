import { StackedAxial, stringifyStackedAxial } from "@towers/shared/hexgrid";

import { stackedToWorld } from "@/common/util/hex2three";

import { Html, useCursor } from "@react-three/drei";
import { ArrowBigDownDashIcon, CheckIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import * as THREE from "three";

import { useGameCommands } from "../../realtime/use-game-commands";
import { selectCurrentAction, selectCurrentActionStep } from "../../store/game.selectors";
import { useGameStore } from "../../store/game.store";
import { TowerModel } from "../models/tower";

export function PlaceTowerConfirm() {
    const actionState = useGameStore((s) => s.actionState);
    const action = useGameStore(selectCurrentAction);
    const actionStep = useGameStore(selectCurrentActionStep);
    const decreaseActionStep = useGameStore((s) => s.decreaseActionStep);
    const { submitAction } = useGameCommands();

    const handleConfirm = () => {
        if (!actionState || !action || !actionStep) return null;
        if (action.name !== "placeTower" || actionStep !== "confirm") return null;

        const coord = actionState.data.selectedCoord as StackedAxial;
        submitAction({
            name: "placeTower",
            coord,
        });
    };

    const highlightedHex = useMemo(() => {
        if (!actionState || !action || !actionStep) return null;
        if (action.name !== "placeTower" || actionStep !== "confirm") return null;

        return actionState.data.selectedCoord as StackedAxial;
    }, [actionState, action, actionStep]);

    return (
        highlightedHex && (
            <group position={stackedToWorld(highlightedHex)}>
                <TowerModel ghost={true} />
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

export function PlaceTowerIndicators() {
    const action = useGameStore(selectCurrentAction);
    const actionStep = useGameStore(selectCurrentActionStep);

    const highlightedHexes = useMemo(() => {
        if (!action || !actionStep) return [];
        if (actionStep === "selectHex") {
            if (action.name === "placeTower") return action.availableCoords ?? [];
        }
        return [];
    }, [action, actionStep]);

    return (
        <group>
            {highlightedHexes.map((coord) => (
                <PlaceTowerIndicator key={stringifyStackedAxial(coord)} coord={coord} />
            ))}
        </group>
    );
}

export function PlaceTowerIndicator({ coord }: { coord: StackedAxial }) {
    const setActionData = useGameStore((s) => s.setActionData);
    const advanceActionStep = useGameStore((s) => s.advanceActionStep);

    const [hovered, setHovered] = useState(false);
    useCursor(hovered, "pointer", "auto");

    const handleClick = () => {
        setActionData("selectedCoord", coord);
        advanceActionStep();
    };

    const geometry = useMemo(() => {
        const shape = new THREE.Shape();
        const radius = 1;

        const points = [...Array(6).keys()].map((i) => {
            const theta = ((i + 0.5) / 6) * Math.PI * 2;
            return new THREE.Vector2(Math.cos(theta) * radius, Math.sin(theta) * radius);
        });

        shape.moveTo(points[0]?.x, points[0]?.y);
        for (const p of points.slice(1)) shape.lineTo(p.x, p.y);
        shape.closePath();

        const geo = new THREE.ShapeGeometry(shape);
        geo.rotateX(-Math.PI / 2);
        return geo;
    }, []);

    return (
        <group position={stackedToWorld(coord)}>
            <mesh
                geometry={geometry}
                onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                }}
                onPointerMove={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                }}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    setHovered(false);
                }}
                userData={{ coord }}
            >
                <meshBasicMaterial
                    depthWrite={false}
                    opacity={0}
                    side={THREE.DoubleSide}
                    transparent
                />
            </mesh>

            {hovered && <TowerModel ghost={true} />}
            {!hovered && (
                <Html position={[0, 0.5, 0]} center occlude>
                    <ArrowBigDownDashIcon className="text-green-400 size-7 drop-shadow-sm" />
                </Html>
            )}
        </group>
    );
}
