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
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "fulfilled") {
        updateData.fulfilledAt = new Date();
      }
    }

    const request = await db.documentRequest.updateMany({
      where: { id, userId: session.user.id },
      data: updateData,
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error("Update document request error:", error);
    return NextResponse.json({ error: "Failed to update document request" }, { status: 500 });
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

    await db.documentRequest.deleteMany({
      where: { id, userId: session.user.id, status: "pending" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete document request error:", error);
    return NextResponse.json({ error: "Failed to delete document request" }, { status: 500 });
  }
}
