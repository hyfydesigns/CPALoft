import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { unlink, rmdir } from "fs/promises";
import path from "path";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Collect portal user IDs before cascade wipes clients
    const clients = await db.client.findMany({
      where: { userId },
      select: { portalUserId: true },
    });
    const portalUserIds = clients
      .map((c) => c.portalUserId)
      .filter(Boolean) as string[];

    // Delete the CPA user — cascades to: clients, documents (db), chats, messages, aiUsage, sessions, accounts
    await db.user.delete({ where: { id: userId } });

    // Delete orphaned portal user accounts
    if (portalUserIds.length > 0) {
      await db.user.deleteMany({ where: { id: { in: portalUserIds } } });
    }

    // Remove uploaded files from disk
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", userId);
      const { readdir } = await import("fs/promises");
      const files = await readdir(uploadDir);
      await Promise.all(files.map((f) => unlink(path.join(uploadDir, f)).catch(() => {})));
      await rmdir(uploadDir).catch(() => {});
    } catch {
      // Upload dir may not exist — fine
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
