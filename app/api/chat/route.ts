import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import { CPA_SYSTEM_PROMPT } from "@/lib/anthropic";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

function getApiKey(): string {
  // 1. Try process.env first (normal Next.js loading)
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  // 2. Fallback: parse .env.local directly
  try {
    const envFile = path.join(process.cwd(), ".env.local");
    const content = fs.readFileSync(envFile, "utf-8");
    const match = content.match(/^ANTHROPIC_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/m);
    if (match?.[1]) return match[1].trim();
  } catch {}
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, chatId } = await req.json();
    if (!messages?.length) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    // Strip out any empty-content messages (Anthropic rejects them)
    const cleanMessages = messages.filter(
      (m: { role: string; content: string }) => m.content?.trim()
    );
    if (!cleanMessages.length) {
      return NextResponse.json({ error: "No valid messages" }, { status: 400 });
    }

    // Check usage limits for free plan
    if (session.user.plan === "free") {
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const usage = await db.aiUsage.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: thisMonth },
          type: "chat",
        },
      });

      if (usage >= 10) {
        return NextResponse.json(
          {
            error:
              "Monthly AI message limit reached. Upgrade to Pro for 500 messages/month.",
          },
          { status: 429 }
        );
      }
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }
    const anthropic = new Anthropic({ apiKey });

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = "";

          const anthropicStream = await anthropic.messages.stream({
            model: "claude-sonnet-4-5",
            max_tokens: 4096,
            system: CPA_SYSTEM_PROMPT,
            messages: cleanMessages.map(
              (m: { role: string; content: string }) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })
            ),
          });

          for await (const chunk of anthropicStream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              fullResponse += chunk.delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
              );
            }
          }

          // Save message and usage
          const userMessage = cleanMessages[cleanMessages.length - 1];
          let chat = chatId ? await db.chat.findUnique({ where: { id: chatId } }) : null;

          if (!chat) {
            const title =
              userMessage.content.slice(0, 60) +
              (userMessage.content.length > 60 ? "..." : "");
            chat = await db.chat.create({
              data: { title, userId: session.user.id },
            });
          }

          await db.message.createMany({
            data: [
              { role: "user", content: userMessage.content, chatId: chat.id },
              { role: "assistant", content: fullResponse, chatId: chat.id },
            ],
          });

          await db.aiUsage.create({
            data: {
              userId: session.user.id,
              tokens: Math.ceil(fullResponse.length / 4),
              type: "chat",
            },
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, chatId: chat.id })}\n\n`
            )
          );
          controller.close();
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : String(error);
          console.error("Stream error:", msg);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await db.chat.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Get chats error:", error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}
