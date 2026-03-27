export function makeMetaTitle(...parts: string[]) {
    return ["towers", ...parts].join(" — ");
}
