import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

    const updateData: Record<string, unknown> = {};
    if (data.label !== undefined) updateData.label = data.label;
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.reminderEnabled !== undefined) updateData.reminderEnabled = Boolean(data.reminderEnabled);
    if (data.notes !== undefined) updateData.notes = data.notes;

    const deadline = await db.taxDeadline.updateMany({
      where: { id, userId: session.user.id },
      data: updateData,
    });

    return NextResponse.json(deadline);
  } catch (error) {
    console.error("Update tax deadline error:", error);
    return NextResponse.json({ error: "Failed to update tax deadline" }, { status: 500 });
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

    await db.taxDeadline.deleteMany({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete tax deadline error:", error);
    return NextResponse.json({ error: "Failed to delete tax deadline" }, { status: 500 });
  }
}
