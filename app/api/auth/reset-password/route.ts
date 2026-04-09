import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: {
        verifyToken: token,
        verifyExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        verifyToken: null,
        verifyExpiry: null,
        // Ensure account stays verified
        emailVerified: user.emailVerified ?? new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
