import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchBlobContent } from "@/lib/blob";

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

    let firmLogo = cpaUser?.firmLogo ?? null;

    // Convert private blob URL to a data URL so the <img> tag can load it
    if (firmLogo && firmLogo.startsWith("https://")) {
      const result = await fetchBlobContent(firmLogo);
      if (result) {
        firmLogo = `data:${result.contentType};base64,${result.body.toString("base64")}`;
      }
    }

    return NextResponse.json({
      firmLogo,
      portalDisplayName: cpaUser?.portalDisplayName ?? null,
    });
  } catch (error) {
    console.error("Get portal branding error:", error);
    return NextResponse.json({ firmLogo: null, portalDisplayName: null });
  }
}
