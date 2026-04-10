import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await db.client.findFirst({
      where: { id, userId: session.user.id },
      include: {
        documents: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { documents: true } },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Get client error:", error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

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

    const data = await req.json();

    // Get current client for status comparison
    const existing = await db.client.findFirst({
      where: { id, userId: session.user.id },
    });

    const client = await db.client.updateMany({
      where: { id, userId: session.user.id },
      data,
    });

    // Log status change if applicable
    if (existing && data.status && data.status !== existing.status) {
      try {
        await logActivity({
          clientId: id,
          userId: session.user.id,
          type: "status_changed",
          label: `Status changed to ${data.status}`,
          metadata: { from: existing.status, to: data.status },
        });
      } catch {}
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Update client error:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership before deleting
    const client = await db.client.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Delete documents first (schema uses SetNull, not Cascade)
    await db.document.deleteMany({ where: { clientId: id } });

    // Delete the client record (captures portalUserId before it's gone)
    const portalUserId = client.portalUserId;
    await db.client.delete({ where: { id } });

    // Delete the portal user account so the email can be reused
    if (portalUserId) {
      await db.user.delete({ where: { id: portalUserId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete client error:", error);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
