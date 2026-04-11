import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";
import { sendClientInviteEmail } from "@/lib/email";
import { logActivity } from "@/lib/activity";
import { getAppUrl } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const clients = await db.client.findMany({
      where: {
        userId: session.user.id,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { company: { contains: search } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { documents: true } },
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Get clients error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, email, phone, company, taxId, notes, status } = data;

    if (!name) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 });
    }

    // Enforce plan limits
    const { checkPlanLimit } = await import("@/lib/utils");
    const clientCount = await db.client.count({ where: { userId: session.user.id } });
    const limitError = checkPlanLimit("clients", session.user.plan || "free", clientCount);
    if (limitError) {
      return NextResponse.json({ error: limitError }, { status: 403 });
    }

    // Generate invite token upfront if client has an email
    const hasEmail = Boolean(email);
    const inviteToken = hasEmail ? crypto.randomBytes(24).toString("hex") : null;
    const inviteExpiry = hasEmail
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : null;

    const client = await db.client.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        taxId: taxId || null,
        notes: notes || null,
        status: status || "pending",
        userId: session.user.id,
        ...(hasEmail && {
          inviteToken,
          inviteExpiry,
          portalEnabled: true,
        }),
      },
    });

    // Log activity
    try {
      await logActivity({
        clientId: client.id,
        userId: session.user.id,
        type: "client_created",
        label: "Client added",
        metadata: { name: client.name },
      });
    } catch {}

    // Send invite email if client has an email address
    if (hasEmail && inviteToken) {
      const cpaUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });
      const cpaName = cpaUser?.name || "Your accountant";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const inviteUrl = `${appUrl}/portal/register?token=${inviteToken}`;
      try {
        await sendClientInviteEmail(email, name, cpaName, inviteUrl);
      } catch (emailError) {
        console.error("Failed to send client invite email:", emailError);
        console.log("🔗 Client invite URL (dev):", inviteUrl);
      }
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
