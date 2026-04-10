import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { noteId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const note = await db.clientNote.updateMany({
      where: { id: noteId, userId: session.user.id },
      data: {
        ...(data.content !== undefined && { content: data.content }),
        ...(data.pinned !== undefined && { pinned: Boolean(data.pinned) }),
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Update note error:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { noteId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.clientNote.deleteMany({
      where: { id: noteId, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
