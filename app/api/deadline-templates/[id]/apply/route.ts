import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const template = await db.deadlineTemplate.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const body = await req.json();
    const { clientIds, year } = body as { clientIds: string[]; year: number };

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json({ error: "At least one client is required" }, { status: 400 });
    }

    if (!year || typeof year !== "number") {
      return NextResponse.json({ error: "Year is required" }, { status: 400 });
    }

    const items = JSON.parse(template.items) as Array<{
      label: string;
      month: number;
      day: number;
      reminderEnabled: boolean;
    }>;

    let created = 0;
    for (const clientId of clientIds) {
      for (const item of items) {
        await db.taxDeadline.create({
          data: {
            label: item.label,
            dueDate: new Date(year, item.month - 1, item.day),
            status: "upcoming",
            reminderEnabled: item.reminderEnabled,
            userId: session.user.id,
            clientId,
          },
        });
        created++;
      }
    }

    return NextResponse.json({ created });
  } catch (error) {
    console.error("Apply deadline template error:", error);
    return NextResponse.json({ error: "Failed to apply template" }, { status: 500 });
  }
}
