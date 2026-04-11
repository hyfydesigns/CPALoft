import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | undefined;

    // Clients trying to access the CPA dashboard → redirect to portal
    if (pathname.startsWith("/dashboard") && role === "client") {
      return NextResponse.redirect(new URL("/portal", req.url));
    }

    // CPAs trying to access the client portal → redirect to dashboard
    if (pathname.startsWith("/portal") && role === "cpa") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Let the middleware function above handle redirects;
      // only block completely unauthenticated requests to protected paths
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (pathname.startsWith("/dashboard") || pathname.startsWith("/portal")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/portal/:path*"],
};
