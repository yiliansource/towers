import { Box, Line } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/Addons.js";

import {
    STACKED_AXIAL_UP,
    StackedAxial,
    addStackedAxial,
    axial,
    axialRange,
    axialToStacked,
    equalStackedAxial,
    stringifyStackedAxial,
} from "@towers/shared/hexgrid";

import { useGameInfo } from "@/lib/hooks/use-game-info";
import { useGameStore } from "@/lib/stores/game.store";
import { useLobbyStore } from "@/lib/stores/lobby.store";
import { stackedToWorld } from "@/lib/util/hex2three";

import { useHexGeometry } from "./hex-geometry";
import { PlacementPickSurface } from "./placement-pick-surface";

export function HexBoard() {
    const { game, ui } = useGameStore();
    const { isHostUser, isInTurn } = useGameInfo();

    if (!game) throw new Error();

    const floorPositions = useMemo(() => axialRange(axial(0, 0), 4).map((a) => axialToStacked(a, 0)), []);

    const pickablePositions = useMemo(() => {
        const candidates: StackedAxial[] = axialRange(axial(0, 0), 4).map((a) => axialToStacked(a, 0));
        for (const t of game.towers) {
            candidates.push(addStackedAxial(t, STACKED_AXIAL_UP));
        }

        return candidates.filter((p) => !game.towers.some((t) => equalStackedAxial(t, p)));
    }, [game.towers]);

    return (
        <>
            {floorPositions.map((p) => (
                <HexTileOutline key={stringifyStackedAxial(p)} coord={p} />
            ))}

            {isInTurn && ui.hoveredHex && (!ui.selectedHex || !equalStackedAxial(ui.hoveredHex, ui.selectedHex)) && (
                <HexTileHighlight coord={ui.hoveredHex} color="yellow" />
            )}
            {isInTurn && ui.selectedHex && <HexTileHighlight coord={ui.selectedHex} color="green" />}

            {isInTurn &&
                pickablePositions.map((p) => <PlacementPickSurface key={stringifyStackedAxial(p)} coord={p} />)}

            {game.towers.map((coord) => (
                <Tower key={stringifyStackedAxial(coord)} coord={coord} />
            ))}
            {Object.entries(game.units).map(([pid, coords]) =>
                coords.map((c) => <Unit key={stringifyStackedAxial(c)} coord={c} playerId={pid} />),
            )}
        </>
    );
}

function HexTileOutline({ coord }: { coord: StackedAxial }) {
    const points = [...Array(7).keys()].map((i) => {
        const theta = ((i + 0.5) / 6) * (Math.PI * 2);
        return [Math.cos(theta), 0, Math.sin(theta)] as [number, number, number];
    });

    return (
        <group position={stackedToWorld(coord)}>
            <Line points={points} color="#333" lineWidth={1} />
        </group>
    );
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

function Tower({ coord }: { coord: StackedAxial }) {
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

                console.log(mesh);
            }
        });

        return clone;
    }, [obj]);

    return (
        <group position={stackedToWorld(coord)}>
            <primitive object={coloredObj} />
        </group>
    );
}

function Unit({ coord, playerId }: { coord: StackedAxial; playerId: string }) {
    const { lobby } = useLobbyStore();
    if (!lobby) throw new Error();

    const color = ["#00c950", "#fb2c36", "#2b7fff", "#ad46ff"][lobby.seats.findIndex((s) => s.user?.id === playerId)];

    return (
        <group position={stackedToWorld(coord)}>
            <Box position={[0, 0.25, 0]} args={[0.5, 0.5, 0.5]} receiveShadow castShadow>
                <meshStandardMaterial color={color} />
            </Box>
        </group>
    );
}
