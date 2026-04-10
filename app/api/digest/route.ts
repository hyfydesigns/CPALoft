import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requirePremium } from "@/lib/plan-gate";
import { sendPracticeDigestEmail } from "@/lib/email";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gate = requirePremium(session.user.plan || "free");
    if (gate) return gate;

    const now = new Date();
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Upcoming deadlines in next 14 days
    const deadlines = await db.taxDeadline.findMany({
      where: {
        userId: session.user.id,
        status: { not: "completed" },
        dueDate: { gte: now, lte: in14Days },
      },
      include: { client: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
    });

    // Pending document requests
    const requests = await db.documentRequest.findMany({
      where: {
        userId: session.user.id,
        status: "pending",
      },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Recent uploads in last 7 days
    const uploads = await db.document.findMany({
      where: {
        userId: session.user.id,
        status: "active",
        createdAt: { gte: sevenDaysAgo },
      },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    await sendPracticeDigestEmail(
      session.user.email,
      session.user.name || "there",
      {
        deadlines: deadlines.map((d) => ({
          label: d.label,
          dueDate: d.dueDate.toISOString(),
          client: d.client,
        })),
        requests: requests.map((r) => ({
          title: r.title,
          client: r.client,
        })),
        uploads: uploads.map((u) => ({
          originalName: u.originalName,
          client: u.client,
          createdAt: u.createdAt.toISOString(),
        })),
      }
    );

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Digest email error:", error);
    return NextResponse.json({ error: "Failed to send digest" }, { status: 500 });
  }
}
