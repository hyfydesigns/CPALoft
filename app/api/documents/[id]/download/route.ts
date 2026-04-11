import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchBlobContent } from "@/lib/blob";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // CPAs can access docs they own; clients can access docs linked to their client record
    let doc;
    if (session.user.role === "client") {
      const client = await db.client.findFirst({
        where: { portalUserId: session.user.id },
      });
      if (!client) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      doc = await db.document.findFirst({
        where: { id, clientId: client.id },
      });
    } else {
      doc = await db.document.findFirst({
        where: { id, userId: session.user.id },
      });
    }

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const result = await fetchBlobContent(doc.url);
    if (!result) {
      return NextResponse.json({ error: "File not available" }, { status: 404 });
    }

    const isDownload = req.nextUrl.searchParams.get("download") === "1";
    const disposition = isDownload
      ? `attachment; filename="${doc.originalName}"`
      : `inline; filename="${doc.originalName}"`;

    return new NextResponse(result.body, {
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": disposition,
        "Content-Length": String(result.body.length),
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("[documents/download] error:", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
