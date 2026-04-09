import { useHydrateLobbyOnMount } from "@/features/lobby";

import { useGameEvents } from "../realtime/use-game-events";
import { useHydrateGameOnMount } from "./use-hydrate-game-on-mount";

export function useGamePageLifecycle() {
    useHydrateLobbyOnMount();
    useHydrateGameOnMount();
    useGameEvents();
}
