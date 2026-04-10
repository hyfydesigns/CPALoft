import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requirePremium } from "@/lib/plan-gate";
import { extractPdfText } from "@/lib/pdf-extract";

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

    // ── Extract text ─────────────────────────────────────────────────────────
    let initialMessage: string;

    if (doc.type === "pdf") {
      const filePath = path.join(process.cwd(), "public", doc.url);
      const buffer = await readFile(filePath);
      const { text, method, pages } = await extractPdfText(buffer);

      if (text.length > 0) {
        const methodNote =
          method === "ocr"
            ? " *(extracted via OCR — scanned document)*"
            : pages
            ? ` *(${pages}-page text-layer PDF)*`
            : "";

        initialMessage = `Please analyze the following document for me:

**File:** ${doc.originalName}${methodNote}
**Category:** ${doc.category}
**Client:** ${clientName}
**Uploaded:** ${uploadedDate}

Here is the extracted text content:

---
${text}
---

Based on the actual content above, please:
1. Summarize what this document contains
2. Highlight key financial figures, tax items, or important dates
3. Identify action items, deadlines, or follow-ups I should consider
4. Flag anything unusual or that warrants closer review`;
      } else {
        // Both text-layer and OCR returned nothing (e.g. encrypted/corrupt PDF)
        initialMessage = `Please analyze this document for me:

**File:** ${doc.originalName}
**Type:** PDF (${doc.category})
**Client:** ${clientName}
**Uploaded:** ${uploadedDate}

⚠️ Text could not be extracted from this PDF. It may be encrypted, corrupted, or a heavily stylized document.

Based on the file name and category, please:
1. Describe what this document likely contains
2. List the key financial or tax items I should look for when reviewing it manually
3. Suggest any action items or follow-ups based on the document type and category`;
      }
    } else {
      // Non-PDF: Word, Excel, images — no extraction available
      const typeLabel =
        doc.type === "image" ? "image file"
        : doc.type === "spreadsheet" ? "spreadsheet"
        : doc.type === "document" ? "Word document"
        : doc.type;

      initialMessage = `Please analyze this document for me:

**File:** ${doc.originalName}
**Type:** ${typeLabel} (${doc.category})
**Client:** ${clientName}
**Uploaded:** ${uploadedDate}

*(Direct text extraction is not available for ${typeLabel}s — analysis is based on file name and category.)*

Based on the file name and category, please:
1. Describe what this document likely contains
2. List the key financial or tax information I should look for when reviewing it
3. Suggest any action items or follow-ups based on the document type and category`;
    }

    // ── Create the chat with the pre-seeded user message ─────────────────────
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
