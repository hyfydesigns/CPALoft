import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadFile } from "@/lib/blob";

// POST /api/portal/upload — client uploads a document to their CPA
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the client record linked to this portal user
    const client = await db.client.findFirst({
      where: { portalUserId: session.user.id },
    });
    if (!client) {
      return NextResponse.json(
        { error: "No client record linked to this account" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = (formData.get("category") as string) || "general";
    const note = (formData.get("note") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not supported. Please upload PDF, image, Excel, Word, or CSV files." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.slice(file.name.lastIndexOf("."));
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const { url } = await uploadFile(
      `uploads/${client.userId}`,
      filename,
      buffer,
      file.type
    );

    let type = "other";
    if (file.type === "application/pdf") type = "pdf";
    else if (file.type.startsWith("image/")) type = "image";
    else if (file.type.includes("excel") || file.type.includes("spreadsheet") || file.type === "text/csv") type = "spreadsheet";
    else if (file.type.includes("word") || file.type.includes("document")) type = "document";

    // Create document record linked to the CPA as owner
    const doc = await db.document.create({
      data: {
        name: file.name.replace(/\.[^/.]+$/, ""),
        originalName: file.name,
        type,
        size: file.size,
        url,
        category,
        uploadedBy: "client",
        userId: client.userId,   // CPA owns it
        clientId: client.id,
        tags: note ? JSON.stringify([note]) : null,
      },
    });

    return NextResponse.json(doc);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[portal/upload] 500 error:", msg, error);
    return NextResponse.json({ error: "Upload failed", detail: msg }, { status: 500 });
  }
}

// GET /api/portal/upload — list docs the client has uploaded
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await db.client.findFirst({
      where: { portalUserId: session.user.id },
    });
    if (!client) {
      return NextResponse.json({ error: "No client record found" }, { status: 404 });
    }

    const docs = await db.document.findMany({
      where: {
        clientId: client.id,
        uploadedBy: "client",
        status: "active",
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(docs);
  } catch (error) {
    console.error("Portal docs error:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}
