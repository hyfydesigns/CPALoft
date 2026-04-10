import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "client") {
      return NextResponse.json({ firmLogo: null, portalDisplayName: null });
    }

    // Find client record for the logged-in portal user
    const client = await db.client.findFirst({
      where: { portalUserId: session.user.id },
    });

    if (!client) {
      return NextResponse.json({ firmLogo: null, portalDisplayName: null });
    }

    // Find the CPA user
    const cpaUser = await db.user.findUnique({
      where: { id: client.userId },
      select: { firmLogo: true, portalDisplayName: true },
    });

    return NextResponse.json({
      firmLogo: cpaUser?.firmLogo ?? null,
      portalDisplayName: cpaUser?.portalDisplayName ?? null,
    });
  } catch (error) {
    console.error("Get portal branding error:", error);
    return NextResponse.json({ firmLogo: null, portalDisplayName: null });
  }
}
