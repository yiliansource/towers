import { cn } from "@/lib/util/cn";

export function FormLabel({ className, children, ...props }: React.ComponentPropsWithoutRef<"p">) {
    return (
        <p {...props} className={cn(className, "cursor-default text-sm leading-tight mb-1 text-(--gray-11)")}>
            {children}
        </p>
    );
}
