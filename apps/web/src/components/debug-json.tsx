"use client";

import { useState } from "react";

import { cn } from "@/lib/util/cn";

export interface DebugJsonProps extends React.HTMLAttributes<HTMLElement> {
    object: unknown;
}

export function DebugJson({ className, object, ...props }: DebugJsonProps) {
    return (
        <pre
            {...props}
            className={cn(
                className,
                "max-w-full overflow-auto whitespace-pre",
                "border border-(--gray-3) text-(--gray-11) p-2 text-sm",
            )}
        >
            <code className="">{JSON.stringify(object, undefined, 2)}</code>
        </pre>
    );
}
