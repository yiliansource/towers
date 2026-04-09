import { Box, Cylinder } from "@react-three/drei";

export function King() {
    const height = 1.2;
    return (
        <group>
            <Cylinder
                args={[0.3, 0.4, height]}
                castShadow
                position={[0, height / 2, 0]}
                receiveShadow
            >
                <meshStandardMaterial color="white" />
            </Cylinder>
            <Box args={[0.5, 0.15, 0.15]} position={[0, 1.5, 0]}>
                <meshStandardMaterial color="white" />
            </Box>
            <Box args={[0.15, 0.5, 0.15]} position={[0, 1.45, 0]}>
                <meshStandardMaterial color="white" />
            </Box>
        </group>
    );
}
