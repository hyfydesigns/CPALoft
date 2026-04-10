"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle2, User, Shield, Bell, Download, Trash2, AlertTriangle, Building2, Lock, X } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: session?.user?.name || "",
    firm: "",
    phone: "",
    licenseNumber: "",
  });

  // Danger zone
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [backupDownloaded, setBackupDownloaded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function exportAccount() {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export", { method: "POST" });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers.get("Content-Disposition") || "";
      const match = cd.match(/filename="([^"]+)"/);
      a.download = match?.[1] || "cpaloft-account-backup.zip";
      a.click();
      URL.revokeObjectURL(url);
      setBackupDownloaded(true);
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      await fetch("/api/account/delete", { method: "POST" });
      await signOut({ redirect: false });
      router.push("/login");
    } finally {
      setDeleting(false);
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800)); // Simulate save
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const initials = getInitials(session?.user?.name || session?.user?.email || "U");

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal and professional details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-forest-600 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" type="button">
                  Change Photo
                </Button>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 2MB</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Sarah Johnson"
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  value={session?.user?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Firm / Company</Label>
                <Input
                  value={form.firm}
                  onChange={(e) => updateField("firm", e.target.value)}
                  placeholder="Johnson & Associates CPA"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label>CPA License Number</Label>
                <Input
                  value={form.licenseNumber}
                  onChange={(e) => updateField("licenseNumber", e.target.value)}
                  placeholder="CPA-2019-TX-XXXXX"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                className="bg-forest-600 hover:bg-forest-700"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
                ) : null}
                {saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-4 h-4" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-800">Password</p>
              <p className="text-xs text-gray-400">Last changed: Never</p>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">
                Two-Factor Authentication
              </p>
              <p className="text-xs text-gray-400">
                Add an extra layer of security
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="mb-6 border-red-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-red-600">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-3 border border-red-100 rounded-xl px-4 bg-red-50/40">
            <div>
              <p className="text-sm font-medium text-gray-800">Delete Account</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Removes your account, all clients, and all documents permanently
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => { setShowDeleteModal(true); setBackupDownloaded(false); }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <Dialog open onOpenChange={() => !deleting && setShowDeleteModal(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Delete Your Account
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-gray-600">
                This will permanently delete your account, all clients, and all documents.
                <strong className="text-gray-900"> This cannot be undone.</strong>
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download a backup first
                </p>
                <p className="text-xs text-amber-700">
                  Save a ZIP of your entire workspace — all clients and documents. You can restore it later.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={exporting}
                  className={backupDownloaded
                    ? "mt-1 border-green-300 text-green-700 hover:bg-green-50"
                    : "mt-1 border-amber-300 text-amber-800 hover:bg-amber-100"}
                  onClick={exportAccount}
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : backupDownloaded ? (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {exporting ? "Preparing ZIP…" : backupDownloaded ? "Backup Downloaded ✓" : "Download Account Backup"}
                </Button>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!backupDownloaded || deleting}
                title={!backupDownloaded ? "Download the backup first" : undefined}
                onClick={deleteAccount}
              >
                {deleting
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting…</>
                  : <><Trash2 className="w-4 h-4 mr-2" />Delete Permanently</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-4 h-4" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose what you want to be notified about
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              label: "AI Usage Alerts",
              desc: "Get notified when approaching your monthly limit",
              enabled: true,
            },
            {
              label: "New Client Activity",
              desc: "Notifications when clients upload documents",
              enabled: true,
            },
            {
              label: "Tax Deadline Reminders",
              desc: "Important IRS and state tax deadlines",
              enabled: false,
            },
            {
              label: "Product Updates",
              desc: "New features and improvements to CPA Loft",
              enabled: true,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <Badge
                variant={item.enabled ? "success" : "secondary"}
                className="text-xs cursor-pointer"
              >
                {item.enabled ? "On" : "Off"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
