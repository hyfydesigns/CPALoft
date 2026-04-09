import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, firm, plan } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    // Generate a secure 48-char hex verification token (24 bytes)
    const verifyToken = crypto.randomBytes(24).toString("hex");
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.user.create({
      data: {
        name,
        email,
        password: hashed,
        firm: firm || null,
        plan: plan || "free",
        role: "cpa",
        verifyToken,
        verifyExpiry,
        // emailVerified remains null until they click the link
      },
    });

    // Build the verification URL
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${verifyToken}`;

    // Send verification email — don't let email failure block registration
    try {
      await sendVerificationEmail(email, name, verifyUrl);
    } catch (emailError) {
      console.error("⚠️  Failed to send verification email:", emailError);
      // Still succeed — user is created; log the link so dev can verify manually
      console.log("🔗 Manual verify URL:", verifyUrl);
    }

    return NextResponse.json({ requiresVerification: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development"
          ? `Registration failed: ${error instanceof Error ? error.message : String(error)}`
          : "Registration failed" },
      { status: 500 }
    );
  }
}
