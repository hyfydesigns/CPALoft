import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/verify-email?error=missing_token", req.url)
    );
  }

  try {
    const user = await db.user.findUnique({ where: { verifyToken: token } });

    if (!user) {
      return NextResponse.redirect(
        new URL("/verify-email?error=invalid_token", req.url)
      );
    }

    if (user.verifyExpiry && user.verifyExpiry < new Date()) {
      return NextResponse.redirect(
        new URL("/verify-email?error=expired_token", req.url)
      );
    }

    // Mark email as verified
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null,
        verifyExpiry: null,
      },
    });

    return NextResponse.redirect(
      new URL("/verify-email?success=true", req.url)
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/verify-email?error=server_error", req.url)
    );
  }
}
