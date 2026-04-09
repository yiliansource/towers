import { type NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
    const loginUrl = new URL("/login", req.url);
    const lobbyUrl = new URL("/lobby", req.url);

    if (req.nextUrl.pathname === "/") {
        return NextResponse.redirect(loginUrl);
    }

    const token = req.cookies.get("access_token")?.value;

    const isLobbyRoute = req.nextUrl.pathname.startsWith(lobbyUrl.pathname);
    const isAuthRoute =
        req.nextUrl.pathname.startsWith(loginUrl.pathname) ||
        req.nextUrl.pathname.startsWith("/register");

    if (isLobbyRoute && !token) {
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && token) {
        return NextResponse.redirect(lobbyUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/lobby", "/login", "/register"],
};
