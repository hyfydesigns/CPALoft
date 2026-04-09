"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { PLANS } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") || "free";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    firm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  function update(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, plan: planParam }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      // Auto sign in
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const planInfo = PLANS[planParam as keyof typeof PLANS] || PLANS.free;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cloud via-mist to-forest-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex mb-6">
            <Logo markSize={40} wordmarkSize="lg" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">
            {planParam !== "free" ? (
              <>Starting with <strong className="text-forest-600">{planInfo.name} Plan</strong> — 14-day free trial</>
            ) : (
              "Free forever — no credit card required"
            )}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Plan info */}
          <div className="bg-forest-50 border border-forest-100 rounded-lg p-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-forest-700 font-medium">{planInfo.name} Plan</span>
              <span className="text-forest-600 font-bold">
                {planInfo.price === 0 ? "Free" : `$${planInfo.price}/mo`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {[
                `${planInfo.aiMessages === -1 ? "Unlimited" : planInfo.aiMessages} AI messages`,
                `${planInfo.clients === -1 ? "Unlimited" : planInfo.clients} clients`,
                `${planInfo.documents === -1 ? "Unlimited" : planInfo.documents} documents`,
                `${planInfo.storage} storage`,
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-1 text-xs text-forest-600">
                  <CheckCircle2 className="w-3 h-3" />
                  {feat}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="Sarah Johnson, CPA"
                value={formData.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firm">Firm / Company (optional)</Label>
              <Input
                id="firm"
                placeholder="Johnson & Associates CPA"
                value={formData.firm}
                onChange={(e) => update("firm", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="sarah@yourfirm.com"
                value={formData.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-forest-600 hover:bg-forest-700 h-11"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            By signing up, you agree to our{" "}
            <a href="#" className="text-forest-600 hover:underline">Terms</a> and{" "}
            <a href="#" className="text-forest-600 hover:underline">Privacy Policy</a>
          </p>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-forest-600 font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-cloud via-mist to-forest-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <SignupForm />
    </Suspense>
  );
}
