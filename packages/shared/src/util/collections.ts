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

export function minBy<T, U extends number | string>(
    arr: readonly T[],
    selector: (item: T) => U,
): T | undefined {
    if (arr.length === 0) return undefined;

    let minItem = arr[0];
    let minValue = selector(minItem);

    for (let i = 1; i < arr.length; i++) {
        const item = arr[i];
        const value = selector(item);

        if (value < minValue) {
            minValue = value;
            minItem = item;
        }
    }

    return minItem;
}
