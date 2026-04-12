export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function waitFor(
    condition: () => boolean,
    options?: {
        interval?: number; // ms between checks
        timeout?: number; // max wait time (ms)
    },
): Promise<void> {
    const { interval = 50, timeout } = options ?? {};

    return new Promise((resolve, reject) => {
        const start = Date.now();

        const check = () => {
            if (condition()) {
                resolve();
                return;
            }

            if (timeout !== undefined && Date.now() - start >= timeout) {
                reject(new Error("waitFor: timeout exceeded"));
                return;
            }

            setTimeout(check, interval);
        };

        check();
    });
}
