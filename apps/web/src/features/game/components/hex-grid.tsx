import { type StackedAxial, stringifyStackedAxial } from "@towers/shared/hexgrid";

import { stackedToWorld } from "@/common/util/hex2three";

import { animated, easings, useTransition } from "@react-spring/three";
import { Circle, Line } from "@react-three/drei";

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
                        <Hex
                            alternate={
                                (item.q + item.r) % 2 === 0 && (item.q - 2 * item.r) % 2 === 0
                            }
                        />
                    </animated.group>
                </group>
            ))}
        </>
    );
}

export function Hex({ alternate = false }: { alternate?: boolean }) {
    const points = [...Array(7).keys()].map((i) => {
        const theta = ((i + 0.5) / 6) * Math.PI * 2;
        return [Math.cos(theta), 0, Math.sin(theta)] as [number, number, number];
    });

    return (
        <group>
            <Circle args={[1, 6]} scale={0.99} rotation={[-Math.PI / 2, 0, Math.PI / 6]}>
                <meshBasicMaterial color={alternate ? "#262626" : "#242424"} />
            </Circle>
            <Line points={points} color="#333" lineWidth={2} />
        </group>
    );
}
