import { useLobbyEvents } from "../realtime/use-lobby-events";
import { useHydrateLobbyOnMount } from "./use-hydrate";

export function useLobbyPageLifecycle() {
    useHydrateLobbyOnMount();

    useLobbyEvents();
}
