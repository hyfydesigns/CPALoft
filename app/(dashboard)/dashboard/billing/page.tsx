"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Star, Crown, CreditCard, ArrowRight } from "lucide-react";
import { PLANS } from "@/lib/utils";

const planDetails = [
  {
    key: "free",
    icon: Star,
    name: "Free",
    price: 0,
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    features: [
      "10 AI messages per month",
      "Up to 5 documents",
      "Up to 3 clients",
      "100 MB storage",
      "PDF preview",
      "Email support",
    ],
  },
  {
    key: "pro",
    icon: Zap,
    name: "Pro",
    price: 49,
    color: "text-forest-600",
    bg: "bg-forest-50",
    border: "border-forest-100",
    popular: true,
    features: [
      "500 AI messages per month",
      "Up to 100 documents",
      "Up to 50 clients",
      "10 GB storage",
      "PDF preview & annotation",
      "Advanced analytics",
      "Client portal access",
      "Priority email support",
    ],
  },
  {
    key: "premium",
    icon: Crown,
    name: "Premium",
    price: 149,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    features: [
      "Unlimited AI messages",
      "Unlimited documents",
      "Unlimited clients",
      "100 GB storage",
      "All Pro features",
      "Team collaboration (5 seats)",
      "Custom integrations",
      "White-label options",
      "Dedicated account manager",
      "Phone & email support",
    ],
  },
];

export default function BillingPage() {
  const { data: session } = useSession();
  const currentPlan = session?.user?.plan || "free";

  function handleUpgrade(plan: string) {
    // In production: redirect to Stripe Checkout
    alert(`Upgrade to ${plan} — Stripe integration would be configured here with your API keys.`);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan Banner */}
      <Card className="mb-8 bg-gradient-to-r from-forest-600 to-forest-900 text-white border-0">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-forest-50 text-sm mb-1">Current Plan</p>
            <h2 className="text-2xl font-bold">
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
            </h2>
            <p className="text-forest-50 text-sm mt-1">
              {currentPlan === "free"
                ? "Upgrade to unlock more AI messages, clients, and storage"
                : currentPlan === "pro"
                ? "You have access to 500 AI messages/month and priority support"
                : "You have unlimited access to all CPA Loft features"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              ${PLANS[currentPlan as keyof typeof PLANS]?.price || 0}
            </div>
            <div className="text-forest-50 text-sm">/month</div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {planDetails.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          return (
            <Card
              key={plan.key}
              className={`relative ${
                plan.popular ? "ring-2 ring-forest-600 shadow-lg shadow-forest-100" : ""
              } ${isCurrent ? "ring-2 ring-green-500" : ""}`}
            >
              {plan.popular && !isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-forest-600 text-white px-3">
                    Most Popular
                  </Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-3">
                    Current Plan
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div
                  className={`w-10 h-10 ${plan.bg} rounded-xl flex items-center justify-center mb-3`}
                >
                  <plan.icon className={`w-5 h-5 ${plan.color}`} />
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-400 mb-1 text-sm">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : plan.price === 0 ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={currentPlan !== "free"}
                  >
                    {currentPlan !== "free" ? "Downgrade" : "Get Started"}
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${
                      plan.key === "pro"
                        ? "bg-forest-600 hover:bg-forest-700"
                        : "bg-forest-900 hover:bg-midnight"
                    }`}
                    onClick={() => handleUpgrade(plan.key)}
                  >
                    Upgrade to {plan.name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-4 h-4" />
            Payment Method
          </CardTitle>
          <CardDescription>
            Manage your payment details for subscription billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan === "free" ? (
            <div className="text-center py-8 text-gray-400">
              <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm text-gray-500">No payment method on file</p>
              <p className="text-xs mt-1">
                Upgrade to a paid plan to add a payment method
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-r from-forest-600 to-forest-700 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    •••• •••• •••• 4242
                  </p>
                  <p className="text-xs text-gray-400">Expires 12/27</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
