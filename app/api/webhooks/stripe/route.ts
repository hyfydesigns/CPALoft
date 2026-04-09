import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

// Stripe requires the raw body for webhook signature verification
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode !== "subscription") break;

        const subscription = await stripe.subscriptions.retrieve(
          checkoutSession.subscription as string
        );
        const userId = checkoutSession.metadata?.userId;
        const plan = checkoutSession.metadata?.plan || "pro";

        if (!userId) break;

        await db.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const plan = subscription.metadata?.plan || "pro";

        await db.user.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            plan,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const plan = subscription.metadata?.plan || "pro";
        const status = subscription.status;

        // If canceled/past_due/unpaid → downgrade to free
        const activePlan = ["active", "trialing"].includes(status) ? plan : "free";

        await db.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan: activePlan,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await db.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan: "free",
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        });
        break;
      }
    }
  } catch (error) {
    console.error(`Error handling webhook event ${event.type}:`, error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
