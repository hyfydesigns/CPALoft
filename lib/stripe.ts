import Stripe from "stripe";

// Lazy singleton — only instantiated on first use at runtime, not at build time.
// This prevents "apiKey not provided" errors during Vercel's static build phase.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

// Keep a named export for convenience — same lazy behaviour
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string | symbol) {
    const client = getStripe() as unknown as Record<string | symbol, unknown>;
    return client[prop];
  },
});

export const PLANS = {
  pro: {
    name: "CPA Loft Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 49,
  },
  premium: {
    name: "CPA Loft Premium",
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    price: 149,
  },
};
</content>
