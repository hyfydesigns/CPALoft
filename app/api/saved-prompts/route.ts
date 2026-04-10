import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requirePro } from "@/lib/plan-gate";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prompts = await db.savedPrompt.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error("Get saved prompts error:", error);
    return NextResponse.json({ error: "Failed to fetch saved prompts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gate = requirePro(session.user.plan || "free");
    if (gate) return gate;

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const prompt = await db.savedPrompt.create({
      data: {
        title,
        content,
        userId: session.user.id,
      },
    });

    return NextResponse.json(prompt);
  } catch (error) {
    console.error("Create saved prompt error:", error);
    return NextResponse.json({ error: "Failed to create saved prompt" }, { status: 500 });
  }
}
