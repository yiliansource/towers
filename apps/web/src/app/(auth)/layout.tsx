import { TowersBanner } from "@/components/towers-banner";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="m-auto flex flex-col items-center">
            <TowersBanner className="mb-2" />
            <div className="flex flex-col w-60">{children}</div>
        </div>
    );
}
