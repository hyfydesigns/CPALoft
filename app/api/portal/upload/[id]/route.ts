import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH /api/portal/upload/[id] — client updates category of their own document
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await db.client.findFirst({
      where: { portalUserId: session.user.id },
    });
    if (!client) {
      return NextResponse.json({ error: "No client record found" }, { status: 404 });
    }

    const { category } = await req.json();
    if (!category) {
      return NextResponse.json({ error: "category is required" }, { status: 400 });
    }

    // Verify the document belongs to this client and was uploaded by them
    const doc = await db.document.findFirst({
      where: { id, clientId: client.id, uploadedBy: "client" },
    });
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const updated = await db.document.update({
      where: { id },
      data: { category },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Portal update document error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
