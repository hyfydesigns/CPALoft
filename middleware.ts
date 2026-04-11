import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role as string | undefined;

  // ── Unauthenticated users hitting the portal ──────────────────────────────
  // Send them to the portal login (not the CPA login page)
  if (!token && (pathname === "/portal" || pathname.startsWith("/portal/"))) {
    const portalLogin = new URL("/portal/login", req.url);
    portalLogin.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(portalLogin);
  }

  // ── Unauthenticated users hitting the CPA dashboard ───────────────────────
  if (!token && (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  // ── Client trying to access CPA dashboard → portal ───────────────────────
  if (role === "client" && (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))) {
    return NextResponse.redirect(new URL("/portal", req.url));
  }

  // ── CPA trying to access client portal → dashboard ────────────────────────
  if (role === "cpa" && (pathname === "/portal" || pathname.startsWith("/portal/"))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/portal", "/portal/:path*"],
};
