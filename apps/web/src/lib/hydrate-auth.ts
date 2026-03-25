import { fetchApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

export async function hydrateAuth() {
    try {
        useAuthStore.getState().setLoading(true);

        const res = await fetchApi("/auth/me");
        if (!res.ok) {
            throw new Error();
        }

        const player = await res.json();
        useAuthStore.getState().setUser(player);
    } catch {
        useAuthStore.getState().logoutLocal();
    }
    useAuthStore.getState().setLoading(false);
}
