import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requirePro } from "@/lib/plan-gate";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    // Auto-update overdue deadlines
    await db.taxDeadline.updateMany({
      where: {
        client: { userId: session.user.id },
        status: "upcoming",
        dueDate: { lt: new Date() },
      },
      data: { status: "overdue" },
    });

    const deadlines = await db.taxDeadline.findMany({
      where: {
        client: { userId: session.user.id },
        ...(clientId ? { clientId } : {}),
      },
      include: {
        client: { select: { name: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(deadlines);
  } catch (error) {
    console.error("Get tax deadlines error:", error);
    return NextResponse.json({ error: "Failed to fetch tax deadlines" }, { status: 500 });
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

    const { clientId, label, dueDate, reminderEnabled, notes } = await req.json();

    if (!clientId || !label || !dueDate) {
      return NextResponse.json({ error: "clientId, label, and dueDate are required" }, { status: 400 });
    }

    // Verify client belongs to this CPA
    const client = await db.client.findFirst({
      where: { id: clientId, userId: session.user.id },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const due = new Date(dueDate);
    const isOverdue = due < new Date();

    const deadline = await db.taxDeadline.create({
      data: {
        clientId,
        userId: session.user.id,
        label,
        dueDate: due,
        status: isOverdue ? "overdue" : "upcoming",
        reminderEnabled: Boolean(reminderEnabled),
        notes: notes || null,
      },
      include: {
        client: { select: { name: true } },
      },
    });

    // Log activity
    try {
      await logActivity({
        clientId,
        userId: session.user.id,
        type: "deadline_added",
        label: `Tax deadline added: ${label}`,
        metadata: { deadlineId: deadline.id, label, dueDate },
      });
    } catch {}

    return NextResponse.json(deadline);
  } catch (error) {
    console.error("Create tax deadline error:", error);
    return NextResponse.json({ error: "Failed to create tax deadline" }, { status: 500 });
  }
}
