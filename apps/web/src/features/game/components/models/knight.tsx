import { Cylinder } from "@react-three/drei";

import { useLobbyStore } from "@/features/lobby";

export function Knight({ playerId }: { playerId: string }) {
    const lobby = useLobbyStore((s) => s.lobby!);

    const color = ["#00c950", "#fb2c36", "#2b7fff", "#ad46ff"][
        lobby.seats.findIndex((s) => s.user?.id === playerId)
    ];
    const height = 0.8;
    return (
        <Cylinder
            args={[0.25, 0.35, height]}
            castShadow
            position={[0, height / 2, 0]}
            receiveShadow
        >
            <meshStandardMaterial color={color} />
        </Cylinder>
    );
}
