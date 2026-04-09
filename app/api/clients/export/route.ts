import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const JSZip = require("jszip");

// POST /api/clients/export  body: { clientId }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await req.json();
    if (!clientId) {
      return NextResponse.json({ error: "clientId required" }, { status: 400 });
    }

    const client = await db.client.findFirst({
      where: { id: clientId, userId: session.user.id },
      include: {
        documents: { where: { status: "active" } },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const zip = new JSZip();

    // client.json — all metadata
    const clientMeta = {
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      client: {
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        taxId: client.taxId,
        status: client.status,
        notes: client.notes,
        createdAt: client.createdAt,
      },
      documents: client.documents.map((d) => ({
        originalName: d.originalName,
        name: d.name,
        type: d.type,
        size: d.size,
        category: d.category,
        tags: d.tags,
        uploadedBy: d.uploadedBy,
        createdAt: d.createdAt,
        _file: `documents/${d.originalName}`,
      })),
    };
    zip.file("client.json", JSON.stringify(clientMeta, null, 2));

    // Add document files
    const docsFolder = zip.folder("documents");
    for (const doc of client.documents) {
      try {
        const filePath = path.join(process.cwd(), "public", doc.url);
        const fileBuffer = await readFile(filePath);
        // Deduplicate filenames
        const safeName = doc.originalName.replace(/[/\\]/g, "_");
        docsFolder.file(safeName, fileBuffer);
      } catch {
        // File missing from disk — skip but keep metadata
        console.warn(`File not found on disk, skipping: ${doc.url}`);
      }
    }

    const zipBuffer: Buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

    const safeName = client.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const filename = `cpaloft-client-${safeName}-${Date.now()}.zip`;

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
