import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
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
