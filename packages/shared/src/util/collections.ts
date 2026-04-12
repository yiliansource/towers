export function uniqueBy<T>(arr: T[], keyFn: (item: T) => string): T[] {
    const seen = new Set<string>();
    return arr.filter((item) => {
        const key = keyFn(item);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

export function groupBy<T, K>(arr: T[], keyFn: (item: T) => K): Map<K, T[]> {
    const result = new Map<K, T[]>();

    for (const item of arr) {
        const key = keyFn(item);
        const group = result.get(key);

        if (group) {
            group.push(item);
        } else {
            result.set(key, [item]);
        }
    }

    return result;
}
