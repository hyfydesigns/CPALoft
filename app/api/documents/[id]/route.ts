import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";
import { sendDocumentTaggedEmail } from "@/lib/email";
import { getAppUrl } from "@/lib/utils";

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

    const doc = await db.document.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    try {
      const filepath = path.join(process.cwd(), "public", doc.url);
      await unlink(filepath);
    } catch {
      // File might not exist, continue
    }

    await db.document.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
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

    const updates = await req.json();

    // Fetch current doc to detect clientId change
    const existing = await db.document.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const doc = await db.document.update({
      where: { id },
      data: updates,
      include: { client: { select: { id: true, name: true } } },
    });

    // Send notification if a new client is being tagged
    const newClientId = updates.clientId;
    if (newClientId && newClientId !== existing.clientId) {
      try {
        const client = await db.client.findUnique({
          where: { id: newClientId },
          include: { portalUser: { select: { email: true, name: true } } },
        });
        if (client?.email) {
          const cpa = await db.user.findUnique({
            where: { id: session.user.id },
            select: { name: true },
          });
          const cpaName = cpa?.name || "Your accountant";
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          const toEmail = client.portalUser?.email ?? client.email;
          const toName = client.portalUser?.name ?? client.name;
          await sendDocumentTaggedEmail(toEmail, toName, cpaName, existing.originalName, `${appUrl}/portal`);
        }
      } catch (err) {
        console.error("Failed to send document tag notification:", err);
      }
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error("Update document error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
