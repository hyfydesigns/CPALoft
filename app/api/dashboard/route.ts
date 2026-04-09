import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [
      totalClients,
      activeClients,
      totalDocuments,
      totalChats,
      aiUsageThisMonth,
      recentDocuments,
      recentActivity,
    ] = await Promise.all([
      db.client.count({ where: { userId } }),
      db.client.count({ where: { userId, status: "active" } }),
      db.document.count({ where: { userId, status: "active" } }),
      db.chat.count({ where: { userId } }),
      db.aiUsage.count({
        where: { userId, createdAt: { gte: thisMonth }, type: "chat" },
      }),
      db.document.findMany({
        where: { userId, status: "active" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { client: { select: { name: true } } },
      }),
      db.chat.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalClients,
        activeClients,
        totalDocuments,
        totalChats,
        aiUsageThisMonth,
      },
      recentDocuments,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
