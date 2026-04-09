import { animated, easings, useTransition } from "@react-spring/three";
import { Line } from "@react-three/drei";

import { type StackedAxial, stringifyStackedAxial } from "@towers/shared/hexgrid";

import { stackedToWorld } from "@/common/util/hex2three";

export function HexGrid({ positions }: { positions: StackedAxial[] }) {
    const transitions = useTransition(positions, {
        from: {
            scale: 0,
        },
        enter: {
            scale: 1,
        },
        leave: {
            scale: 0,
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
                    <animated.group scale={style.scale}>
                        <Hex />
                    </animated.group>
                </group>
            ))}
        </>
    );
}

export function Hex() {
    const points = [...Array(7).keys()].map((i) => {
        const theta = ((i + 0.5) / 6) * (Math.PI * 2);
        return [Math.cos(theta), 0, Math.sin(theta)] as [number, number, number];
    });

    return <Line color="#333" lineWidth={1} points={points} />;
}
