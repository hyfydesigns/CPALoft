import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requirePremium } from "@/lib/plan-gate";
import { uploadFile } from "@/lib/blob";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { firmLogo: true, portalDisplayName: true },
    });

    return NextResponse.json({
      firmLogo: user?.firmLogo ?? null,
      portalDisplayName: user?.portalDisplayName ?? null,
    });
  } catch (error) {
    console.error("Get branding error:", error);
    return NextResponse.json({ error: "Failed to fetch branding" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gate = requirePremium(session.user.plan || "free");
    if (gate) return gate;

    const body = await req.json();
    const { firmLogo, portalDisplayName } = body as {
      firmLogo?: string | null;
      portalDisplayName?: string | null;
    };

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(firmLogo !== undefined && { firmLogo }),
        ...(portalDisplayName !== undefined && { portalDisplayName }),
      },
      select: { firmLogo: true, portalDisplayName: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update branding error:", error);
    return NextResponse.json({ error: "Failed to update branding" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gate = requirePremium(session.user.plan || "free");
    if (gate) return gate;

    const formData = await req.formData();
    const logo = formData.get("logo") as File | null;

    if (!logo) {
      return NextResponse.json({ error: "No logo file provided" }, { status: 400 });
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(logo.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, and GIF files are allowed" }, { status: 400 });
    }

    // Validate size (2MB)
    if (logo.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Logo must be less than 2MB" }, { status: 400 });
    }

    const bytes = await logo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", session.user.id);
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(logo.name);
    const filename = `logo-${Date.now()}${ext}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${session.user.id}/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Logo upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
