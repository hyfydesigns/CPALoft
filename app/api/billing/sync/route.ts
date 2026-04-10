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

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ plan: user?.plan || "free" });
    }

    // Fetch active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // No active subscription — check trialing too
      const trialing = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "trialing",
        limit: 1,
      });

      if (trialing.data.length === 0) {
        await db.user.update({
          where: { id: user.id },
          data: { plan: "free", stripeSubscriptionId: null, stripePriceId: null, stripeCurrentPeriodEnd: null },
        });
        return NextResponse.json({ plan: "free" });
      }

      const sub = trialing.data[0];
      const priceId = sub.items.data[0].price.id;
      const plan = getPlanFromPriceId(priceId);
      const periodEnd = (sub.items.data[0] as unknown as { current_period_end: number }).current_period_end;

      await db.user.update({
        where: { id: user.id },
        data: {
          plan,
          stripeSubscriptionId: sub.id,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: new Date(periodEnd * 1000),
        },
      });
      return NextResponse.json({ plan });
    }

    const sub = subscriptions.data[0];
    const priceId = sub.items.data[0].price.id;
    const plan = getPlanFromPriceId(priceId);
    const periodEnd = (sub.items.data[0] as unknown as { current_period_end: number }).current_period_end;

    await db.user.update({
      where: { id: user.id },
      data: {
        plan,
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: new Date(periodEnd * 1000),
      },
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
