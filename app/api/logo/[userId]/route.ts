import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchBlobContent } from "@/lib/blob";

// GET /api/logo/[userId]
// Public endpoint — no auth required — used to serve firm logos in client emails.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { firmLogo: true },
    });

    if (!user?.firmLogo) {
      return new NextResponse(null, { status: 404 });
    }

    const result = await fetchBlobContent(user.firmLogo);
    if (!result) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(result.body as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("[logo] Error serving firm logo:", error);
    return new NextResponse(null, { status: 404 });
  }
}
