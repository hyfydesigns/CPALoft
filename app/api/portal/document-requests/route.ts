import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look up client via portal user
    const client = await db.client.findFirst({
      where: { portalUserId: session.user.id },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const requests = await db.documentRequest.findMany({
      where: {
        clientId: client.id,
        status: { in: ["pending", "fulfilled"] },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Get portal document requests error:", error);
    return NextResponse.json({ error: "Failed to fetch document requests" }, { status: 500 });
  }
}
