"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  FileText,
  ArrowLeft,
} from "lucide-react";

interface Preview {
  account: { name: string; email: string; firm?: string | null };
  clientCount: number;
  documentCount: number;
}

export default function RestoreAccountPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [success, setSuccess] = useState<{ email: string; clientsRestored: number; docsRestored: number } | null>(null);
  const [error, setError] = useState("");

  async function handleFileChange(selected: File | null) {
    setFile(selected);
    setPreview(null);
    setError("");
    setSuccess(null);
    if (!selected) return;

    setPreviewing(true);
    try {
      const fd = new FormData();
      fd.append("zip", selected);
      fd.append("preview", "1");
      const res = await fetch("/api/account/restore", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setPreview(data);
      else setError(data.error || "Could not read backup file.");
    } catch {
      setError("Failed to read the ZIP file.");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleRestore() {
    if (!file) return;
    setRestoring(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("zip", file);
      const res = await fetch("/api/account/restore", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data);
        setFile(null);
        setPreview(null);
      } else {
        setError(data.error || "Restore failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cloud via-mist to-forest-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex mb-6">
            <Logo markSize={40} wordmarkSize="lg" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Restore Account</h1>
          <p className="text-gray-500 mt-1">Recover your workspace from a backup</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
          {success ? (
            /* ── Success state ── */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Account Restored!</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Your workspace has been recovered.
                </p>
              </div>
              <div className="bg-forest-50 rounded-xl p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Account</span>
                  <span className="font-medium">{success.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Clients restored</span>
                  <span className="font-medium">{success.clientsRestored}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Documents restored</span>
                  <span className="font-medium">{success.docsRestored}</span>
                </div>
              </div>
              <p className="text-xs text-forest-600">
                A welcome-back email has been sent to <strong>{success.email}</strong>
              </p>
              <Link href="/login">
                <Button className="w-full bg-forest-600 hover:bg-forest-700 mt-2">
                  Sign In Now
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* ── Upload area ── */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-forest-300 transition-colors">
                <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-forest-600" />
                </div>
                <p className="text-sm text-gray-700 font-medium mb-1">
                  {file ? file.name : "Select your CPA Loft backup ZIP"}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Files are named <span className="font-mono">cpaloft-account-*.zip</span>
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    {file ? "Change file" : "Choose ZIP file"}
                  </span>
                </label>
              </div>

              {/* ── Previewing spinner ── */}
              {previewing && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin text-forest-600" />
                  Reading backup…
                </div>
              )}

              {/* ── Preview card ── */}
              {preview && (
                <div className="bg-forest-50 border border-forest-100 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-forest-800">Backup contents</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name</span>
                      <span className="font-medium">{preview.account.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium">{preview.account.email}</span>
                    </div>
                    {preview.account.firm && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Firm</span>
                        <span>{preview.account.firm}</span>
                      </div>
                    )}
                    <div className="border-t border-forest-100 pt-2 flex gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-forest-700">
                        <Users className="w-3.5 h-3.5" />
                        {preview.clientCount} client{preview.clientCount !== 1 ? "s" : ""}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-forest-700">
                        <FileText className="w-3.5 h-3.5" />
                        {preview.documentCount} document{preview.documentCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Error ── */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* ── Actions ── */}
              <Button
                className="w-full bg-forest-600 hover:bg-forest-700 h-11"
                disabled={!preview || restoring}
                onClick={handleRestore}
              >
                {restoring ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Restoring…</>
                ) : (
                  <><RotateCcw className="w-4 h-4 mr-2" />Restore My Account</>
                )}
              </Button>
            </>
          )}

          {/* ── Back to login ── */}
          {!success && (
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-forest-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
