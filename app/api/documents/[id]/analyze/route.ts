import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requirePremium } from "@/lib/plan-gate";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gate = requirePremium(session.user.plan || "free");
    if (gate) return gate;

    const { id } = await params;

    const doc = await db.document.findFirst({
      where: { id, userId: session.user.id },
      include: {
        client: { select: { name: true } },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const clientName = doc.client?.name ?? "No client assigned";
    const uploadedDate = new Date(doc.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const initialMessage = `Please analyze this document for me:

**File:** ${doc.originalName}
**Type:** ${doc.type} (${doc.category})
**Client:** ${clientName}
**Uploaded:** ${uploadedDate}

Please summarize what this document likely contains, what key financial or tax information I should look for, and any action items or follow-ups I should consider based on the document type and category.`;

    const chat = await db.chat.create({
      data: {
        title: `Analysis: ${doc.originalName}`,
        userId: session.user.id,
        messages: {
          create: {
            role: "user",
            content: initialMessage,
          },
        },
      },
    });

    return NextResponse.json({ chatId: chat.id });
  } catch (error) {
    console.error("Document analyze error:", error);
    return NextResponse.json({ error: "Failed to create analysis chat" }, { status: 500 });
  }
}
