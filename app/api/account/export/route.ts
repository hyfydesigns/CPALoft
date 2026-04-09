import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const JSZip = require("jszip");

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        clients: {
          include: { documents: { where: { status: "active" } } },
        },
        documents: { where: { status: "active", clientId: null } },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const zip = new JSZip();

    // account.json — profile + hashed password for seamless restore
    zip.file("account.json", JSON.stringify({
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      account: {
        name: user.name,
        email: user.email,
        firm: user.firm,
        phone: user.phone,
        licenseNumber: user.licenseNumber,
        hashedPassword: user.password,
        emailVerified: user.emailVerified,
      },
    }, null, 2));

    const clientsFolder = zip.folder("clients");

    // Each client gets its own subfolder
    for (const client of user.clients) {
      const folderName = client.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const clientFolder = clientsFolder.folder(folderName);

      clientFolder.file("client.json", JSON.stringify({
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        taxId: client.taxId,
        status: client.status,
        notes: client.notes,
        createdAt: client.createdAt,
        documents: client.documents.map((d) => ({
          originalName: d.originalName,
          name: d.name,
          type: d.type,
          size: d.size,
          category: d.category,
          tags: d.tags,
          uploadedBy: d.uploadedBy,
          createdAt: d.createdAt,
          _file: `documents/${d.originalName.replace(/[/\\]/g, "_")}`,
        })),
      }, null, 2));

      const docsFolder = clientFolder.folder("documents");
      for (const doc of client.documents) {
        try {
          const buf = await readFile(path.join(process.cwd(), "public", doc.url));
          docsFolder.file(doc.originalName.replace(/[/\\]/g, "_"), buf);
        } catch {
          console.warn("File missing, skipping:", doc.url);
        }
      }
    }

    // Non-client documents
    if (user.documents.length > 0) {
      const generalFolder = zip.folder("general-documents");
      for (const doc of user.documents) {
        try {
          const buf = await readFile(path.join(process.cwd(), "public", doc.url));
          generalFolder.file(doc.originalName.replace(/[/\\]/g, "_"), buf);
        } catch {
          console.warn("File missing, skipping:", doc.url);
        }
      }
    }

    const zipBuffer: Buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    const safeName = (user.name || user.email || "account").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const filename = `cpaloft-account-${safeName}-${Date.now()}.zip`;

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Account export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
