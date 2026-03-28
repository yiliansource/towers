// "use client";

// import { Html } from "@react-three/drei";
// import { Canvas, useLoader } from "@react-three/fiber";
// import { useMemo } from "react";
// import * as THREE from "three";
// import { OBJLoader } from "three/examples/jsm/Addons.js";

// import { Axial, axial, axialRange, hexToPixel } from "@towers/shared/hexgrid";

// export default function TestPage() {
//     return (
//         <div>
//             <div className="top-0 left-0 fixed h-dvh w-dvw">
//                 <Canvas>
//                     {/* <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} /> */}

//                     {axialRange(axial(0, 0), 4).map((a) => {
//                         return <TileFloor key={JSON.stringify(a)} hex={a} />;
//                     })}
//                 </Canvas>
//             </div>
//         </div>
//     );
// }
