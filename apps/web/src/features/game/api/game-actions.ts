import type { GameState } from "@towers/shared/contracts";

import { fetchApi } from "@/common/util/fetch-api";

export async function getGame(): Promise<GameState | null> {
    const res = await fetchApi("/game");
    if (!res.ok) return null;
    return (await res.json()) as GameState;
}
