import { Text, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import type { Metadata } from "next";
import { Fruktur, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { ProfileWidget } from "@/common/ui/profile-widget";
import { cn } from "@/common/util/cn";
import { makeMetaTitle } from "@/common/util/meta-title";

import "./globals.css";
import { Providers } from "./providers";

const fruktur = Fruktur({
    variable: "--font-fruktur",
    subsets: ["latin"],
    weight: "400",
});

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: makeMetaTitle(),
    description: "a board game prototype",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            className={cn(
                [fruktur, geistSans, geistMono].map((f) => f.variable),
                `h-full antialiased`,
            )}
            lang="en"
            suppressHydrationWarning
        >
            <Providers>
                <body className="min-h-dvh">
                    <Theme accentColor="gold" appearance="dark" className="flex flex-col">
                        <main className="grow px-4 flex flex-col">{children}</main>
                        <footer className="position z-50 py-3 px-4 select-none flex flex-row justify-between items-end">
                            <Text className="text-(--gray-10)" size="2">
                                Copypright &copy; {new Date().getFullYear()} Ian Hornik
                            </Text>
                            <ProfileWidget />
                        </footer>
                    </Theme>

                    <div>
                        <Toaster position="bottom-center" />
                    </div>
                </body>
            </Providers>
        </html>
    );
}
