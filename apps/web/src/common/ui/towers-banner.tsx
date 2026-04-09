import type React from "react";

import { cn } from "@/common/util/cn";

export function TowersBanner({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    return (
        <div {...props} className={cn(className, "flex flex-row gap-4 items-center select-none")}>
            <Ornament className="-rotate-90" />
            <h1 className="leading-none font-fruktur text-[70px] md:text-[100px]">towers</h1>
            <Ornament className="rotate-90" />
        </div>
    );
}

function Ornament({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <div>
            {/** biome-ignore lint/performance/noImgElement: just easier to use this here */}
            <img
                {...props}
                alt="Decorative Ornament"
                className={cn(className, "w-8 md:w-10 opacity-40 translate-y-1")}
                draggable={false}
                src="./ornament.png"
            />
        </div>
    );
}
