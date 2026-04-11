import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { sendCpaWelcomeBackEmail } from "@/lib/email";
import { getAppUrl } from "@/lib/utils";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const JSZip = require("jszip");

interface AccountMeta {
  exportVersion: number;
  account: {
    name: string;
    email: string;
    firm?: string | null;
    phone?: string | null;
    licenseNumber?: string | null;
    hashedPassword?: string | null;
    emailVerified?: string | null;
  };
}

interface ClientMeta {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  taxId?: string | null;
  status?: string;
  notes?: string | null;
  documents: Array<{
    originalName: string;
    name: string;
    type: string;
    size: number;
    category: string;
    tags?: string | null;
    uploadedBy?: string;
    _file: string;
  }>;
}

// No auth required — restoring a deleted account
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const zipFile = formData.get("zip") as File | null;
    const previewOnly = formData.get("preview") === "1";

    if (!zipFile) {
      return NextResponse.json({ error: "No ZIP file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await zipFile.arrayBuffer());
    const zip = await JSZip.loadAsync(buffer);

    // Read account.json
    const accountFile = zip.file("account.json");
    if (!accountFile) {
      return NextResponse.json({ error: "Invalid backup — account.json not found" }, { status: 400 });
    }

    const accountMeta: AccountMeta = JSON.parse(await accountFile.async("string"));
    if (!accountMeta.account?.email) {
      return NextResponse.json({ error: "Invalid backup — missing account email" }, { status: 400 });
    }

    // Count clients and docs
    const clientFolders: string[] = [];
    zip.folder("clients")?.forEach((_: string, file: { name: string; dir: boolean }) => {
      if (file.dir) {
        const parts = file.name.replace(/^clients\//, "").split("/");
        if (parts.length === 2 && parts[1] === "") clientFolders.push(parts[0]);
      }
    });

    let totalDocs = 0;
    for (const folder of clientFolders) {
      const clientJson = zip.file(`clients/${folder}/client.json`);
      if (clientJson) {
        const meta: ClientMeta = JSON.parse(await clientJson.async("string"));
        totalDocs += meta.documents?.length ?? 0;
      }
    }

    if (previewOnly) {
      return NextResponse.json({
        account: {
          name: accountMeta.account.name,
          email: accountMeta.account.email,
          firm: accountMeta.account.firm,
        },
        clientCount: clientFolders.length,
        documentCount: totalDocs,
      });
    }

    // Check for existing account
    const existing = await db.user.findUnique({ where: { email: accountMeta.account.email } });
    if (existing) {
      return NextResponse.json(
        { error: `An account with email ${accountMeta.account.email} already exists. Please log in instead.` },
        { status: 409 }
      );
    }

    // Restore the CPA account
    const restoredUser = await db.user.create({
      data: {
        name: accountMeta.account.name,
        email: accountMeta.account.email,
        firm: accountMeta.account.firm ?? null,
        phone: accountMeta.account.phone ?? null,
        licenseNumber: accountMeta.account.licenseNumber ?? null,
        password: accountMeta.account.hashedPassword ?? null,
        role: "cpa",
        plan: "free",
        emailVerified: new Date(), // trusted restore
      },
    });

    const uploadDir = path.join(process.cwd(), "public", "uploads", restoredUser.id);
    await mkdir(uploadDir, { recursive: true });

    let clientsRestored = 0;
    let docsRestored = 0;

    // Restore clients
    for (const folder of clientFolders) {
      const clientJson = zip.file(`clients/${folder}/client.json`);
      if (!clientJson) continue;

      const clientMeta: ClientMeta = JSON.parse(await clientJson.async("string"));

      const restoredClient = await db.client.create({
        data: {
          name: clientMeta.name,
          email: clientMeta.email ?? null,
          phone: clientMeta.phone ?? null,
          company: clientMeta.company ?? null,
          taxId: clientMeta.taxId ?? null,
          notes: clientMeta.notes ?? null,
          status: clientMeta.status ?? "active",
          userId: restoredUser.id,
        },
      });
      clientsRestored++;

      for (const docMeta of clientMeta.documents ?? []) {
        const zipEntry = zip.file(`clients/${folder}/${docMeta._file}`);
        if (!zipEntry) continue;
        try {
          const fileBuffer: Buffer = await zipEntry.async("nodebuffer");
          const ext = path.extname(docMeta.originalName);
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
          await writeFile(path.join(uploadDir, filename), fileBuffer);
          await db.document.create({
            data: {
              name: docMeta.name,
              originalName: docMeta.originalName,
              type: docMeta.type,
              size: docMeta.size,
              url: `/uploads/${restoredUser.id}/${filename}`,
              category: docMeta.category ?? "general",
              tags: docMeta.tags ?? null,
              uploadedBy: docMeta.uploadedBy ?? "cpa",
              userId: restoredUser.id,
              clientId: restoredClient.id,
            },
          });
          docsRestored++;
        } catch (err) {
          console.error("Failed to restore doc:", docMeta.originalName, err);
        }
      }
    }

    // Send welcome-back email
    const appUrl = getAppUrl();
    try {
      await sendCpaWelcomeBackEmail(
        restoredUser.email!,
        restoredUser.name ?? "there",
        `${appUrl}/login`
      );
    } catch (emailErr) {
      console.error("Failed to send CPA welcome-back email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      email: restoredUser.email,
      clientsRestored,
      docsRestored,
    });
  } catch (error) {
    console.error("Account restore error:", error);
    return NextResponse.json({ error: "Restore failed" }, { status: 500 });
  }
}
