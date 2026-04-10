import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const client = await db.client.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const [documents, deadlines, activity, requests, notes] = await Promise.all([
      db.document.findMany({
        where: { clientId: id, userId: session.user.id, status: "active" },
        orderBy: { createdAt: "desc" },
      }),
      db.taxDeadline.findMany({
        where: { clientId: id, userId: session.user.id },
        orderBy: { dueDate: "asc" },
      }),
      db.activityLog.findMany({
        where: { clientId: id, userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      db.documentRequest.findMany({
        where: { clientId: id, userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
      db.clientNote.findMany({
        where: { clientId: id, userId: session.user.id },
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      }),
    ]);

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        taxId: client.taxId,
        status: client.status,
        notes: client.notes,
        createdAt: client.createdAt,
      },
      documents,
      deadlines,
      activity,
      requests,
      notes,
    });
  } catch (error) {
    console.error("Get client report error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
