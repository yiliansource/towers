import { clientEnv } from "../env.client";

const isDev = clientEnv.NODE_ENV === "development";

export const createLogger = (scope: string) => ({
    log: (...args: unknown[]) => {
        if (isDev) console.log(`[${scope}]`, ...args);
    },
    error: (...args: unknown[]) => {
        console.error(`[${scope}]`, ...args);
    },
});
