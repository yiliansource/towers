"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { JSX } from "react";
import { Vector3 } from "three";
import { OBJLoader } from "three/examples/jsm/Addons.js";

import { axial, axialRange, hexToPixel } from "@towers/shared/hexgrid";

export default function TestPage() {
    return (
        <div>
            <p>lets see what we can build ...</p>
            <div className="top-0 left-0 bg-gray-300 fixed h-dvh w-dvw">
                <Canvas>
                    <PerspectiveCamera makeDefault position={new Vector3(0, 5, -5).setLength(18)} />
                    <ambientLight intensity={Math.PI / 2} />
                    {/* <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} /> */}
                    <OrbitControls
                        makeDefault
                        minPolarAngle={(10 * Math.PI) / 180}
                        maxPolarAngle={(70 * Math.PI) / 180}
                        enablePan={false}
                        enableZoom={false}
                    />

                    {axialRange(axial(0, 0), 4).map((a) => {
                        const [x, y] = hexToPixel(a);
                        return <TileFloor key={JSON.stringify(a)} position={[x, 0, y]} />;
                    })}
                </Canvas>
            </div>
        </div>
    );
}

function TileFloor(props: Omit<JSX.IntrinsicElements["primitive"], "object">) {
    const obj = useLoader(OBJLoader, "/hextile.obj");
    const clone = obj.clone();
    clone.scale.copy(new Vector3(1, 1, 1).multiplyScalar(0.97));
    return <primitive {...props} object={clone} />;
}
