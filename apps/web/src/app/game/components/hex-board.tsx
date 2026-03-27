export function HexBoard({ tileKeys }: { tileKeys: string[] }) {
    return (
        <>
            {tileKeys.map((key) => (
                <ConnectedTile key={key} hexKey={key} />
            ))}
        </>
    );
}
