import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requirePremium } from "@/lib/plan-gate";
import { readFile } from "fs/promises";
import path from "path";

// pdf-parse doesn't have great ESM support — require() is safer in Next.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

// Max characters of PDF text to send to the AI (keeps token cost reasonable)
const MAX_TEXT_CHARS = 12000;

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
      include: { client: { select: { name: true } } },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const clientName = doc.client?.name ?? "No client assigned";
    const uploadedDate = new Date(doc.createdAt).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });

    // --- Attempt to extract text from PDF ---
    let extractedText: string | null = null;
    if (doc.type === "pdf") {
      try {
        const filePath = path.join(process.cwd(), "public", doc.url);
        const fileBuffer = await readFile(filePath);
        const parsed = await pdfParse(fileBuffer);
        const rawText = (parsed.text as string).trim();
        if (rawText.length > 0) {
          // Truncate if very long, add ellipsis so AI knows it was cut
          extractedText = rawText.length > MAX_TEXT_CHARS
            ? rawText.slice(0, MAX_TEXT_CHARS) + "\n\n[... document truncated for length ...]"
            : rawText;
        }
      } catch (pdfErr) {
        console.warn("PDF text extraction failed, falling back to metadata only:", pdfErr);
      }
    }

    // --- Build the AI prompt ---
    let initialMessage: string;

    if (extractedText) {
      initialMessage = `Please analyze the following document for me:

**File:** ${doc.originalName}
**Type:** ${doc.type} (${doc.category})
**Client:** ${clientName}
**Uploaded:** ${uploadedDate}

Here is the extracted text content from the document:

---
${extractedText}
---

Based on the actual content above, please:
1. Summarize what this document contains
2. Highlight any key financial figures, tax items, or important dates
3. Identify any action items, deadlines, or follow-ups I should consider
4. Flag anything unusual or that warrants closer review`;
    } else {
      // Fallback for non-PDF files or PDFs where text extraction failed
      const noTextReason = doc.type !== "pdf"
        ? `(This is a ${doc.type} file — direct text extraction is not supported for this format.)`
        : "(Text could not be extracted from this PDF — it may be scanned/image-based.)";

      initialMessage = `Please analyze this document for me:

**File:** ${doc.originalName}
**Type:** ${doc.type} (${doc.category})
**Client:** ${clientName}
**Uploaded:** ${uploadedDate}

${noTextReason}

Based on the file name, type, and category, please:
1. Describe what this document likely contains
2. List the key financial or tax information I should look for when reviewing it
3. Suggest any action items or follow-ups based on the document type and category`;
    }

    const chat = await db.chat.create({
      data: {
        title: `Analysis: ${doc.originalName}`,
        userId: session.user.id,
        messages: {
          create: { role: "user", content: initialMessage },
        },
      },
    });

    return NextResponse.json({ chatId: chat.id });
  } catch (error) {
    console.error("Document analyze error:", error);
    return NextResponse.json({ error: "Failed to create analysis chat" }, { status: 500 });
  }
}
