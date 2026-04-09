import { useLobbyEvents } from "../realtime/use-lobby-events";
import { useHydrateLobbyOnMount } from "./use-hydrate-lobby-on-mount";

export function useLobbyPageLifecycle() {
    useHydrateLobbyOnMount();

    useLobbyEvents();
}
