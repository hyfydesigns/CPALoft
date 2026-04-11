import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";
import { sendClientInviteEmail } from "@/lib/email";
import { getAppUrl } from "@/lib/utils";

// POST /api/clients/resend-invite  body: { clientId }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await req.json();
    if (!clientId) {
      return NextResponse.json({ error: "clientId required" }, { status: 400 });
    }

    // Verify ownership
    const client = await db.client.findFirst({
      where: { id: clientId, userId: session.user.id },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    if (!client.email) {
      return NextResponse.json(
        { error: "Client has no email address" },
        { status: 400 }
      );
    }

    // Generate a fresh token
    const token = crypto.randomBytes(24).toString("hex");
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.client.update({
      where: { id: clientId },
      data: { inviteToken: token, inviteExpiry: expiry, portalEnabled: true },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/portal/register?token=${token}`;

    const cpaUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    const cpaName = cpaUser?.name || "Your accountant";

    try {
      await sendClientInviteEmail(client.email, client.name, cpaName, inviteUrl);
    } catch (emailError) {
      console.error("Failed to resend invite email:", emailError);
      console.log("🔗 Invite URL (dev):", inviteUrl);
    }

    return NextResponse.json({ success: true, inviteUrl });
  } catch (error) {
    console.error("Resend invite error:", error);
    return NextResponse.json({ error: "Failed to resend invite" }, { status: 500 });
  }
}
