import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";
import { getAppUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    // Always return success — don't reveal whether the email exists
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Already verified — nothing to do
    if (user.emailVerified) {
      return NextResponse.json({ ok: true });
    }

    // Generate a fresh token
    const verifyToken = crypto.randomBytes(24).toString("hex");
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.user.update({
      where: { id: user.id },
      data: { verifyToken, verifyExpiry },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${verifyToken}`;

    await sendVerificationEmail(email, user.name || email, verifyUrl);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "Failed to resend email" }, { status: 500 });
  }
}
