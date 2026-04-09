import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const documents = await db.document.findMany({
      where: {
        userId: session.user.id,
        ...(clientId && { clientId }),
        ...(category && category !== "all" && { category }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { originalName: { contains: search } },
          ],
        }),
        status: "active",
      },
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = (formData.get("category") as string) || "general";
    const clientId = formData.get("clientId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Allowed types
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
        { error: "File type not allowed. Supported: PDF, images, Excel, Word, CSV" },
        { status: 400 }
      );
    }

    // Save file to public/uploads
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", session.user.id);
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${session.user.id}/${filename}`;

    // Determine type
    let type = "other";
    if (file.type === "application/pdf") type = "pdf";
    else if (file.type.startsWith("image/")) type = "image";
    else if (file.type.includes("excel") || file.type.includes("spreadsheet") || file.type === "text/csv") type = "spreadsheet";
    else if (file.type.includes("word") || file.type.includes("document")) type = "document";

    const doc = await db.document.create({
      data: {
        name: file.name.replace(/\.[^/.]+$/, ""),
        originalName: file.name,
        type,
        size: file.size,
        url,
        category,
        userId: session.user.id,
        ...(clientId && { clientId }),
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(doc);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
