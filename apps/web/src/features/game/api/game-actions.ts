import type { GameSnapshot } from "@towers/shared/contracts";

import { fetchApi } from "@/common/util/fetch-api";

export async function getGame(): Promise<GameSnapshot | null> {
    const res = await fetchApi("/game");
    if (!res.ok) return null;

    return (await res.json()) as GameSnapshot;
}
