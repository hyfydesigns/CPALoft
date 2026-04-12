import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAppUrl } from "@/lib/utils";

// GET /api/portal/public-branding?cpa={userId}
// Public — no auth. Returns firm branding for premium CPAs only.
// Used by the portal login and register pages to show the CPA's logo/name.
export async function GET(req: NextRequest) {
  const cpaId = req.nextUrl.searchParams.get("cpa");
  if (!cpaId) {
    return NextResponse.json({ logoUrl: null, displayName: null });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: cpaId },
      select: { firmLogo: true, portalDisplayName: true, plan: true },
    });

    if (!user || user.plan !== "premium") {
      return NextResponse.json({ logoUrl: null, displayName: null });
    }

    return NextResponse.json({
      logoUrl: user.firmLogo ? `${getAppUrl()}/api/logo/${cpaId}` : null,
      displayName: user.portalDisplayName || null,
    });
  } catch {
    return NextResponse.json({ logoUrl: null, displayName: null });
  }
}
