import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role as string | undefined;

  // ── Unauthenticated users hitting the portal ──────────────────────────────
  // Send them to the portal login — but skip auth pages to avoid redirect loops
  const portalPublicPaths = ["/portal/login", "/portal/register", "/portal/forgot-password"];
  const isPortalPublic = portalPublicPaths.some((p) => pathname === p || pathname.startsWith(p + "?"));

  if (!token && !isPortalPublic && (pathname === "/portal" || pathname.startsWith("/portal/"))) {
    const portalLogin = new URL("/portal/login", req.url);
    portalLogin.searchParams.set("callbackUrl", pathname);
    // Preserve ?cpa= so the login page can show the firm's branding
    const cpaId = req.nextUrl.searchParams.get("cpa");
    if (cpaId) portalLogin.searchParams.set("cpa", cpaId);
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

  // ── CPA trying to access client portal → portal login ────────────────────
  // The CPA may have a tab open while a client clicks an email link in the same
  // browser. Send them to the portal login page (not the dashboard) so the
  // client can sign in with their own credentials.
  if (role === "cpa" && !isPortalPublic && (pathname === "/portal" || pathname.startsWith("/portal/"))) {
    const portalLogin = new URL("/portal/login", req.url);
    portalLogin.searchParams.set("notice", "cpa");
    portalLogin.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(portalLogin);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/portal", "/portal/:path*"],
};
