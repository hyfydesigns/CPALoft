"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface ClientInfo {
  clientId: string;
  name: string;
  email?: string | null;
  company?: string | null;
  cpaId?: string | null;
}

interface PortalBranding {
  logoUrl: string | null;
  displayName: string | null;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [tokenLoading, setTokenLoading] = useState(true);
  const [branding, setBranding] = useState<PortalBranding | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Validate the token on mount
  useEffect(() => {
    if (!token) {
      setTokenError("No invite token found. Please use the link provided by your CPA.");
      setTokenLoading(false);
      return;
    }
    fetch(`/api/portal/register?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setTokenError(data.error);
        } else {
          setClientInfo(data);
          setName(data.name || "");
          // Fetch CPA branding if available
          if (data.cpaId) {
            fetch(`/api/portal/public-branding?cpa=${data.cpaId}`)
              .then((r) => r.json())
              .then((b) => { if (b.logoUrl || b.displayName) setBranding(b); })
              .catch(() => {});
          }
        }
      })
      .catch(() => setTokenError("Failed to validate invite link."))
      .finally(() => setTokenLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/portal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Auto sign in
      const result = await signIn("credentials", {
        email: clientInfo?.email || data.email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/portal/login");
      } else {
        router.push("/portal");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cloud via-mist to-forest-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex mb-4">
            <Logo markSize={40} wordmarkSize="lg" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Client Portal Setup</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Create your secure account to share documents with your CPA
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {tokenLoading ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <Loader2 className="w-8 h-8 text-forest-600 animate-spin" />
              <p className="text-sm text-gray-500">Validating your invite link…</p>
            </div>
          ) : tokenError ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Invalid Invite</h3>
              <p className="text-sm text-gray-500 mb-6">{tokenError}</p>
              <Link href="/portal/login">
                <Button variant="outline">Go to Login</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Client info banner */}
              <div className="bg-forest-50 border border-forest-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-forest-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-forest-700">
                    Invite verified for <strong>{clientInfo?.name}</strong>
                  </p>
                  {clientInfo?.company && (
                    <p className="text-xs text-forest-600 mt-0.5">{clientInfo.company}</p>
                  )}
                  {clientInfo?.email && (
                    <p className="text-xs text-forest-600 mt-0.5">{clientInfo.email}</p>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Your full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Smith"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Create a password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
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
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Create Account & Access Portal
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-4">
                Already set up your account?{" "}
                <Link href="/portal/login" className="text-forest-600 hover:underline">
                  Sign in here
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PortalRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-cloud via-mist to-forest-50 flex items-center justify-center"><Loader2 className="w-8 h-8 text-forest-600 animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
