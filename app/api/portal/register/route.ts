import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendClientWelcomeEmail } from "@/lib/email";

// GET /api/portal/register?token=xxx — validate the invite token
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const client = await db.client.findFirst({
      where: {
        inviteToken: token,
        inviteExpiry: { gt: new Date() },
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        portalUserId: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Invalid or expired invite link" },
        { status: 404 }
      );
    }

    if (client.portalUserId) {
      return NextResponse.json(
        { error: "This invite has already been used. Please log in instead." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      clientId: client.id,
      name: client.name,
      email: client.email,
      company: client.company,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}

// POST /api/portal/register — client sets password and creates their account
export async function POST(req: NextRequest) {
  try {
    const { token, password, name } = await req.json();

    if (!token || !password || !name) {
      return NextResponse.json(
        { error: "Token, name, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const client = await db.client.findFirst({
      where: {
        inviteToken: token,
        inviteExpiry: { gt: new Date() },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Invalid or expired invite link" },
        { status: 404 }
      );
    }

    if (client.portalUserId) {
      return NextResponse.json(
        { error: "Account already created. Please log in." },
        { status: 409 }
      );
    }

    // Check if email already has an account
    if (client.email) {
      const existing = await db.user.findUnique({ where: { email: client.email } });
      if (existing) {
        return NextResponse.json(
          { error: "An account already exists for this email. Please log in." },
          { status: 409 }
        );
      }
    }

    const hashed = await bcrypt.hash(password, 12);

    // Create the portal user account
    const portalUser = await db.user.create({
      data: {
        name,
        email: client.email,
        password: hashed,
        role: "client",
        plan: "free",
      },
    });

    // Link the user to their client record, clear invite token, set status active
    const updatedClient = await db.client.update({
      where: { id: client.id },
      data: {
        portalUserId: portalUser.id,
        inviteToken: null,
        inviteExpiry: null,
        portalEnabled: true,
        status: "active",
      },
      include: {
        user: { select: { name: true } },
      },
    });

    // Send welcome email
    if (portalUser.email) {
      const cpaName = updatedClient.user?.name || "Your accountant";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const portalLoginUrl = `${appUrl}/portal/login`;
      try {
        await sendClientWelcomeEmail(portalUser.email, portalUser.name ?? name, cpaName, portalLoginUrl);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
    }

    return NextResponse.json({
      id: portalUser.id,
      email: portalUser.email,
      name: portalUser.name,
    });
  } catch (error) {
    console.error("Portal register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
