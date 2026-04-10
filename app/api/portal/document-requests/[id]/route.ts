import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look up client via portal user
    const client = await db.client.findFirst({
      where: { portalUserId: session.user.id },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Verify the request belongs to this client
    const docRequest = await db.documentRequest.findFirst({
      where: { id, clientId: client.id },
    });
    if (!docRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const updated = await db.documentRequest.update({
      where: { id },
      data: {
        status: "fulfilled",
        fulfilledAt: new Date(),
      },
    });

    // Log activity
    try {
      await logActivity({
        clientId: client.id,
        userId: client.userId,
        type: "request_fulfilled",
        label: `Document request fulfilled: ${docRequest.title}`,
        metadata: { requestId: id, title: docRequest.title },
      });
    } catch {}

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Portal fulfill document request error:", error);
    return NextResponse.json({ error: "Failed to update document request" }, { status: 500 });
  }
}
