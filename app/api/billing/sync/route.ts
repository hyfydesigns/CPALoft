import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/stripe";

function getPlanFromPriceId(priceId: string): string {
  if (priceId === PLANS.pro.priceId) return "pro";
  if (priceId === PLANS.premium.priceId) return "premium";
  return "free";
}

function getPlanFromSub(sub: { items: { data: Array<{ price: { id: string } }> }; metadata?: Record<string, string> }): string {
  // Try matching by price ID first
  const priceId = sub.items.data[0]?.price?.id;
  if (priceId) {
    const byPrice = getPlanFromPriceId(priceId);
    if (byPrice !== "free") return byPrice;
  }
  // Fall back to metadata (set at checkout time)
  const meta = sub.metadata?.plan;
  if (meta === "pro" || meta === "premium") return meta;
  // Any active subscription defaults to pro if we can't determine
  return "pro";
}

function getPeriodEnd(sub: { items: { data: Array<unknown> } }): Date | null {
  const item = sub.items.data[0] as Record<string, unknown>;
  if (!item) return null;
  const ts = item.current_period_end as number | undefined;
  return ts ? new Date(ts * 1000) : null;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If no Stripe customer yet, nothing to sync
    if (!user.stripeCustomerId) {
      console.log("[sync] No stripeCustomerId for user", user.id);
      return NextResponse.json({ plan: user.plan || "free" });
    }

    // Fetch subscriptions from Stripe (active + trialing)
    const [activeList, trialingList] = await Promise.all([
      stripe.subscriptions.list({ customer: user.stripeCustomerId, status: "active", limit: 1 }),
      stripe.subscriptions.list({ customer: user.stripeCustomerId, status: "trialing", limit: 1 }),
    ]);

    const sub = activeList.data[0] ?? trialingList.data[0];

    if (!sub) {
      console.log("[sync] No active subscription found for customer", user.stripeCustomerId);
      await db.user.update({
        where: { id: user.id },
        data: { plan: "free", stripeSubscriptionId: null, stripePriceId: null, stripeCurrentPeriodEnd: null },
      });
      return NextResponse.json({ plan: "free" });
    }

    const plan = getPlanFromSub(sub);
    const priceId = sub.items.data[0]?.price?.id ?? null;
    const periodEnd = getPeriodEnd(sub);

    console.log("[sync] Updating user", user.id, "→ plan:", plan, "sub:", sub.id);

    await db.user.update({
      where: { id: user.id },
      data: {
        plan,
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: periodEnd,
      },
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("[sync] Error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
