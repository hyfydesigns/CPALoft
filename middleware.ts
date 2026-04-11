import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = token?.role as string | undefined;

    // ── Unauthenticated users ─────────────────────────────────────────────────
    // Send portal visitors to the portal login, not the CPA login
    if (!token && pathname.startsWith("/portal")) {
      const portalLogin = new URL("/portal/login", req.url);
      portalLogin.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(portalLogin);
    }

    // ── Role mismatch guards ──────────────────────────────────────────────────
    // Clients trying to access the CPA dashboard → send to portal
    if (pathname.startsWith("/dashboard") && role === "client") {
      return NextResponse.redirect(new URL("/portal", req.url));
    }

    // CPAs trying to access the client portal → send to dashboard
    if (pathname.startsWith("/portal") && role === "cpa") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Always run the middleware function above; handle auth logic there
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/portal/:path*"],
};
