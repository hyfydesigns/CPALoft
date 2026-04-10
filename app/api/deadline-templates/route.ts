import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requirePremium } from "@/lib/plan-gate";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gate = requirePremium(session.user.plan || "free");
    if (gate) return gate;

    const templates = await db.deadlineTemplate.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Parse items JSON for each template
    const result = templates.map((t) => ({
      ...t,
      items: JSON.parse(t.items),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get deadline templates error:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
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

    const body = await req.json();
    const { name, items } = body as {
      name: string;
      items: Array<{ label: string; month: number; day: number; reminderEnabled: boolean }>;
    };

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Template must have at least one item" }, { status: 400 });
    }

    const template = await db.deadlineTemplate.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        items: JSON.stringify(items),
      },
    });

    return NextResponse.json({ ...template, items });
  } catch (error) {
    console.error("Create deadline template error:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
