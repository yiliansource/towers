import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export function SceneCamera() {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const { gl } = useThree();

    const cameraPosition = useMemo(() => new THREE.Vector3(-1, 4, -5).setLength(16), []);

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

        const setCursor = (value: string) => {
            if (el.style.cursor !== value) el.style.cursor = value;
        };

        const onPointerDown = (e: PointerEvent) => {
            pointerDown = true;
            moved = false;
            button = e.button;
            downX = e.clientX;
            downY = e.clientY;
        };

        const onPointerMove = (e: PointerEvent) => {
            if (el.style.cursor === "") setCursor("grab");
            if (!pointerDown) return;

            const dx = e.clientX - downX;
            const dy = e.clientY - downY;
            const dist = Math.hypot(dx, dy);

            if (dist > MOVE_THRESHOLD) {
                moved = true;
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

        const onControlStart = () => {
            setCursor("grabbing");
        };

        const onControlEnd = () => {
            setCursor("grab");
        };

        const onPointerEnter = () => {
            setCursor("grab");
        };

        const onPointerLeave = () => {
            setCursor("");
        };

        el.addEventListener("pointerdown", onPointerDown);
        el.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        el.addEventListener("contextmenu", onContextMenu);

        el.addEventListener("pointerenter", onPointerEnter);
        el.addEventListener("pointerleave", onPointerLeave);

        controls.addEventListener("start", onControlStart);
        controls.addEventListener("end", onControlEnd);

        return () => {
            el.removeEventListener("pointerdown", onPointerDown);
            el.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            el.removeEventListener("contextmenu", onContextMenu);

            el.removeEventListener("pointerenter", onPointerEnter);
            el.removeEventListener("pointerleave", onPointerLeave);

            controls.removeEventListener("start", onControlStart);
            controls.removeEventListener("end", onControlEnd);

            el.style.cursor = "";
        };
    }, [gl.domElement, controlsRef.current]);

    return (
        <>
            <PerspectiveCamera makeDefault position={cameraPosition} />
            <OrbitControls
                ref={controlsRef}
                makeDefault
                minPolarAngle={(30 * Math.PI) / 180}
                maxPolarAngle={(70 * Math.PI) / 180}
                enablePan={false}
                minDistance={10}
                maxDistance={20}
                dampingFactor={0.2}
            />
        </>
    );
}
