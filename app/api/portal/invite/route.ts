import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";
import { sendClientInviteEmail } from "@/lib/email";
import { getAppUrl } from "@/lib/utils";

// POST /api/portal/invite — CPA generates an invite link for a client
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

    // Verify the client belongs to this CPA
    const client = await db.client.findFirst({
      where: { id: clientId, userId: session.user.id },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Generate a secure random token (48 hex chars)
    const token = crypto.randomBytes(24).toString("hex");
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.client.update({
      where: { id: clientId },
      data: {
        inviteToken: token,
        inviteExpiry: expiry,
        portalEnabled: true,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/portal/register?token=${token}`;

    // Send invite email if the client has an email address
    if (client.email) {
      const cpaUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });
      const cpaName = cpaUser?.name || "Your accountant";
      try {
        await sendClientInviteEmail(client.email, client.name, cpaName, inviteUrl);
      } catch (emailError) {
        console.error("Failed to send invite email:", emailError);
        console.log("🔗 Invite URL (dev):", inviteUrl);
      }
    }

    return NextResponse.json({ inviteUrl, token, expiry, emailSent: Boolean(client.email) });
  } catch (error) {
    console.error("Invite error:", error);
    return NextResponse.json({ error: "Failed to generate invite" }, { status: 500 });
  }
}
