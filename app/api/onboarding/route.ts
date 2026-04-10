import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true, createdAt: true },
  });

  return NextResponse.json({
    onboardingCompleted: user?.onboardingCompleted ?? false,
    createdAt: user?.createdAt,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { completed } = await req.json();

  await db.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: completed === true },
  });

  return NextResponse.json({ ok: true });
}
