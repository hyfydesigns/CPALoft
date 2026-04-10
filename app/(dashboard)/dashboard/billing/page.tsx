"use client";

import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Star, Crown, CreditCard, ArrowRight, Loader2, CheckCircle, XCircle } from "lucide-react";
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPlan = session?.user?.plan || "free";
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // On Stripe success redirect: sync plan from Stripe → update JWT cookie → redirect to dashboard
  useEffect(() => {
    if (searchParams.get("success") === "1") {
      setSyncing(true);
      fetch("/api/billing/sync", { method: "POST" })
        .then((r) => r.json())
        .then(async (data) => {
          if (data.plan) {
            // Update JWT cookie with fresh plan from DB, then hard-navigate so the
            // new cookie is sent with the next request and dashboard sees the right plan
            await updateSession();
            window.location.href = "/dashboard?upgraded=" + data.plan;
          } else {
            setSyncing(false);
            setToast({ type: "error", message: data.error || "Could not verify subscription. Please refresh." });
            router.replace("/dashboard/billing");
          }
        })
        .catch(() => {
          setSyncing(false);
          setToast({ type: "error", message: "Network error verifying subscription. Please refresh." });
          router.replace("/dashboard/billing");
        });
    } else if (searchParams.get("canceled") === "1") {
      setToast({ type: "error", message: "Checkout was canceled. No changes were made." });
      router.replace("/dashboard/billing");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpgrade(plan: string) {
    if (plan === "free") return;
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setToast({ type: "error", message: data.error || "Something went wrong." });
      }
    } catch {
      setToast({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handleManageSubscription() {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setToast({ type: "error", message: data.error || "Could not open billing portal." });
      }
    } catch {
      setToast({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoadingPortal(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {syncing && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium bg-forest-600 text-white">
          <Loader2 className="w-4 h-4 animate-spin" />
          Verifying your subscription…
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan Banner */}
      <Card className="mb-8 bg-gradient-to-r from-forest-600 to-forest-900 text-white border-0">
        <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
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
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold">
                ${PLANS[currentPlan as keyof typeof PLANS]?.price || 0}
              </div>
              <div className="text-forest-50 text-sm">/month</div>
            </div>
            {currentPlan !== "free" && (
              <Button
                variant="outline"
                className="text-forest-800 border-white/40 hover:bg-white/10 hover:text-white"
                onClick={handleManageSubscription}
                disabled={loadingPortal}
              >
                {loadingPortal ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Manage Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {planDetails.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          const isLoading = loadingPlan === plan.key;
          return (
            <Card
              key={plan.key}
              className={`relative ${
                plan.popular ? "ring-2 ring-forest-600 shadow-lg shadow-forest-100" : ""
              } ${isCurrent ? "ring-2 ring-green-500" : ""}`}
            >
              {plan.popular && !isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-forest-600 text-white px-3">Most Popular</Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-3">Current Plan</Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className={`w-10 h-10 ${plan.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <plan.icon className={`w-5 h-5 ${plan.color}`} />
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-gray-400 mb-1 text-sm">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
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
                    onClick={handleManageSubscription}
                    disabled={currentPlan === "free" || loadingPortal}
                  >
                    {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {currentPlan === "free" ? "Current Plan" : "Downgrade to Free"}
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${
                      plan.key === "pro"
                        ? "bg-forest-600 hover:bg-forest-700"
                        : "bg-forest-900 hover:bg-midnight"
                    }`}
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {isLoading ? "Redirecting…" : `Upgrade to ${plan.name}`}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
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
            Manage your payment details and billing history via the Stripe portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan === "free" ? (
            <div className="text-center py-8 text-gray-400">
              <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm text-gray-500">No payment method on file</p>
              <p className="text-xs mt-1">Upgrade to a paid plan to add a payment method</p>
            </div>
          ) : (
            <div className="flex items-center justify-between py-3">
              <p className="text-sm text-gray-600">
                Your billing details and invoices are managed securely via Stripe.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageSubscription}
                disabled={loadingPortal}
              >
                {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Open Billing Portal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
