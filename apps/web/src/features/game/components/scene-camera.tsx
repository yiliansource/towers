import { OrbitControls, PerspectiveCamera, useCursor } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { useGameStore } from "../store/game.store";

export function SceneCamera() {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const { gl } = useThree();

    const defaultCameraPosition = useMemo(() => new THREE.Vector3(0, 5, 5).setLength(16), []);

    const [grabbing, setGrabbing] = useState(false);
    useCursor((controlsRef.current?.enabled ?? false) && grabbing, "grabbing", "auto");

    const draggingHex = useGameStore((s) => s.ui.draggingHex);

    // biome-ignore lint/correctness/useExhaustiveDependencies: need to rebind events when ref changes
    useEffect(() => {
        if (!controlsRef.current) return;
        controlsRef.current.enabled = !draggingHex;
    }, [controlsRef.current, draggingHex]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: need to rebind events when ref changes
    useEffect(() => {
        const el = gl.domElement;
        const controls = controlsRef.current;
        if (!el || !controls) return;

        let pointerDown = false;
        let moved = false;
        let button: number | null = null;
        let downX = 0;
        let downY = 0;

        const MOVE_THRESHOLD = 4;

        const onPointerDown = (e: PointerEvent) => {
            pointerDown = true;
            moved = false;
            button = e.button;
            downX = e.clientX;
            downY = e.clientY;
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!pointerDown) return;

            const dx = e.clientX - downX;
            const dy = e.clientY - downY;
            const dist = Math.hypot(dx, dy);

            if (dist > MOVE_THRESHOLD) {
                moved = true;
                setGrabbing(true);
            }
        };

        const onPointerUp = (e: PointerEvent) => {
            if (!pointerDown) return;

            const wasClick = !moved && button === e.button;

            if (wasClick) {
                if (e.button === 0) {
                } else if (e.button === 2) {
                }
            } else {
            }

            pointerDown = false;
            moved = false;
            button = null;
        };

        const onContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const onControlStart = () => {};

        const onControlEnd = () => {
            setGrabbing(false);
        };

        el.addEventListener("pointerdown", onPointerDown);
        el.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        el.addEventListener("contextmenu", onContextMenu);

        controls.addEventListener("start", onControlStart);
        controls.addEventListener("end", onControlEnd);

        return () => {
            el.removeEventListener("pointerdown", onPointerDown);
            el.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            el.removeEventListener("contextmenu", onContextMenu);

            controls.removeEventListener("start", onControlStart);
            controls.removeEventListener("end", onControlEnd);
        };
    }, [gl.domElement, controlsRef.current]);

    return (
        <>
            <PerspectiveCamera makeDefault position={defaultCameraPosition} />
            <OrbitControls
                dampingFactor={0.2}
                enablePan={false}
                makeDefault
                maxDistance={20}
                maxPolarAngle={(70 * Math.PI) / 180}
                minDistance={10}
                minPolarAngle={(30 * Math.PI) / 180}
                ref={controlsRef}
            />
        </>
    );
}
