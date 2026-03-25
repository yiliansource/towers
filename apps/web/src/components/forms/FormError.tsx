import { cn } from "@/lib/cn";

export function FormError({ className, children, ...props }: React.ComponentPropsWithoutRef<"p">) {
    return (
        <p {...props} className={cn(className, "cursor-default text-sm leading-tight mb-1 text-red-400")}>
            {children}
        </p>
    );
}
