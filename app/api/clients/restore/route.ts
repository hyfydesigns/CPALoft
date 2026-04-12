import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { sendClientWelcomeBackEmail, sendClientInviteEmail } from "@/lib/email";
import { getEmailBranding } from "@/lib/email-branding";
import { getAppUrl } from "@/lib/utils";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const JSZip = require("jszip");

interface ClientMeta {
  exportVersion: number;
  client: {
    name: string;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    taxId?: string | null;
    status?: string;
    notes?: string | null;
  };
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

// GET /api/clients/restore?validate=1 — peek inside ZIP and return preview
export async function GET(req: NextRequest) {
  return NextResponse.json({ message: "Use POST to restore" });
}

// POST /api/clients/restore — multipart: field "zip"
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const zipFile = formData.get("zip") as File | null;
    const previewOnly = formData.get("preview") === "1";

    if (!zipFile) {
      return NextResponse.json({ error: "No ZIP file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await zipFile.arrayBuffer());
    const zip = await JSZip.loadAsync(buffer);

    // Read client.json
    const metaFile = zip.file("client.json");
    if (!metaFile) {
      return NextResponse.json({ error: "Invalid backup — client.json not found" }, { status: 400 });
    }

    const metaJson = await metaFile.async("string");
    const meta: ClientMeta = JSON.parse(metaJson);

    if (!meta.client?.name) {
      return NextResponse.json({ error: "Invalid backup — missing client name" }, { status: 400 });
    }

    // Preview mode — just return what we found
    if (previewOnly) {
      return NextResponse.json({
        client: meta.client,
        documentCount: meta.documents?.length ?? 0,
      });
    }

    // Check for duplicate email
    if (meta.client.email) {
      const existing = await db.client.findFirst({
        where: { email: meta.client.email, userId: session.user.id },
      });
      if (existing) {
        return NextResponse.json(
          { error: `A client with email ${meta.client.email} already exists` },
          { status: 409 }
        );
      }
    }

    // Generate invite token so CPA can re-invite the client
    const hasEmail = Boolean(meta.client.email);
    const inviteToken = hasEmail ? crypto.randomBytes(24).toString("hex") : null;
    const inviteExpiry = hasEmail
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : null;

    // Create the restored client
    const restored = await db.client.create({
      data: {
        name: meta.client.name,
        email: meta.client.email ?? null,
        phone: meta.client.phone ?? null,
        company: meta.client.company ?? null,
        taxId: meta.client.taxId ?? null,
        notes: meta.client.notes ?? null,
        status: "pending",
        userId: session.user.id,
        ...(hasEmail && { inviteToken, inviteExpiry, portalEnabled: true }),
      },
    });

    // Restore documents
    const uploadDir = path.join(process.cwd(), "public", "uploads", session.user.id);
    await mkdir(uploadDir, { recursive: true });

    let docsRestored = 0;
    for (const docMeta of meta.documents ?? []) {
      const zipEntry = zip.file(docMeta._file);
      if (!zipEntry) continue;

      try {
        const fileBuffer: Buffer = await zipEntry.async("nodebuffer");
        const ext = path.extname(docMeta.originalName);
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, fileBuffer);

        await db.document.create({
          data: {
            name: docMeta.name,
            originalName: docMeta.originalName,
            type: docMeta.type,
            size: docMeta.size,
            url: `/uploads/${session.user.id}/${filename}`,
            category: docMeta.category ?? "general",
            tags: docMeta.tags ?? null,
            uploadedBy: docMeta.uploadedBy ?? "cpa",
            userId: session.user.id,
            clientId: restored.id,
          },
        });
        docsRestored++;
      } catch (err) {
        console.error(`Failed to restore document ${docMeta.originalName}:`, err);
      }
    }

    // Look up CPA name
    const cpa = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    const cpaName = cpa?.name || "Your accountant";
    const appUrl = getAppUrl();

    // Send welcome-back or invite email
    if (meta.client.email) {
      const inviteUrl = `${appUrl}/portal/register?token=${inviteToken}`;
      try {
        await sendClientWelcomeBackEmail(meta.client.email, meta.client.name, cpaName, inviteUrl);
      } catch (emailErr) {
        console.error("Failed to send welcome-back email:", emailErr);
        // Fall back to regular invite
        try {
          await sendClientInviteEmail(meta.client.email, meta.client.name, cpaName, inviteUrl);
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      clientId: restored.id,
      clientName: restored.name,
      docsRestored,
    });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json({ error: "Restore failed" }, { status: 500 });
  }
}
