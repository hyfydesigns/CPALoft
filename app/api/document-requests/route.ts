import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requirePro } from "@/lib/plan-gate";
import { logActivity } from "@/lib/activity";
import { sendDocumentRequestEmail } from "@/lib/email";
import { getEmailBranding } from "@/lib/email-branding";
import { getAppUrl } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    // Get all clients for this CPA to scope requests
    const clientIds = await db.client.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });
    const allowedIds = clientIds.map((c) => c.id);

    const requests = await db.documentRequest.findMany({
      where: {
        clientId: clientId ? clientId : { in: allowedIds },
        ...(clientId ? {} : { client: { userId: session.user.id } }),
      },
      include: {
        client: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Get document requests error:", error);
    return NextResponse.json({ error: "Failed to fetch document requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gate = requirePro(session.user.plan || "free");
    if (gate) return gate;

    const { clientId, title, description, dueDate } = await req.json();

    if (!clientId || !title) {
      return NextResponse.json({ error: "clientId and title are required" }, { status: 400 });
    }

    // Verify client belongs to this CPA
    const client = await db.client.findFirst({
      where: { id: clientId, userId: session.user.id },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const request = await db.documentRequest.create({
      data: {
        clientId,
        userId: session.user.id,
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "pending",
      },
      include: {
        client: { select: { name: true, email: true } },
      },
    });

    // Log activity
    try {
      await logActivity({
        clientId,
        userId: session.user.id,
        type: "request_sent",
        label: `Document requested: ${title}`,
        metadata: { requestId: request.id, title },
      });
    } catch {}

    // Send email notification (non-blocking)
    if (client.email) {
      try {
        const cpaUser = await db.user.findUnique({
          where: { id: session.user.id },
          select: { name: true },
        });
        const cpaName = cpaUser?.name || "Your accountant";
        const appUrl = getAppUrl();
        const portalUrl = `${appUrl}/portal`;
        await sendDocumentRequestEmail(
          client.email,
          client.name,
          cpaName,
          title,
          description,
          portalUrl
        );
      } catch (emailErr) {
        console.error("Failed to send document request email:", emailErr);
      }
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error("Create document request error:", error);
    return NextResponse.json({ error: "Failed to create document request" }, { status: 500 });
  }
}
