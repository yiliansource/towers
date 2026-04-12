"use client";

import { isStackedAxial } from "@towers/shared/hexgrid";

import { cn } from "@/common/util/cn";

export interface DebugJsonProps extends React.HTMLAttributes<HTMLElement> {
    object: unknown;
}

export function DebugJson({ className, object, ...props }: DebugJsonProps) {
    const json = JSON.stringify(
        object,
        (_, v) => {
            if (isStackedAxial(v)) {
                return `(${[v.q, v.r, v.h].join(",")})`;
            }
            return v;
        },
        2,
    );

    return (
        <pre
            {...props}
            className={cn(
                className,
                "block w-full max-w-full min-w-0 max-h-100 overflow-auto whitespace-pre",
                "border border-(--gray-3) text-(--gray-11) p-2 text-sm",
            )}
        >
            <code className="">{json}</code>
        </pre>
    );
}
