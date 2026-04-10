"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  LogOut,
  X,
  ImageIcon,
  FileSpreadsheet,
  ClipboardList,
  Pencil,
  Check,
} from "lucide-react";
import { cn, formatBytes, formatRelativeDate } from "@/lib/utils";
import { LogoMark } from "@/components/ui/logo";

interface UploadedDoc {
  id: string;
  originalName: string;
  type: string;
  size: number;
  category: string;
  createdAt: string;
}

interface DocumentRequest {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: string;
}

const CATEGORIES = [
  { value: "tax", label: "📋 Tax Return / W-2 / 1099" },
  { value: "financial", label: "📊 Financial Statement" },
  { value: "payroll", label: "💼 Payroll Record" },
  { value: "receipts", label: "🧾 Receipts / Expenses" },
  { value: "general", label: "📁 General / Other" },
];

function getFileIcon(type: string) {
  if (type === "pdf") return <FileText className="w-5 h-5 text-red-500" />;
  if (type === "image") return <ImageIcon className="w-5 h-5 text-purple-500" />;
  if (type === "spreadsheet") return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  return <FileText className="w-5 h-5 text-forest-600" />;
}

export default function ClientPortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState<string[]>([]);
  const [category, setCategory] = useState("general");
  const [note, setNote] = useState("");

  // Document requests
  const [docRequests, setDocRequests] = useState<DocumentRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);

  // Inline category editing
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState("general");
  const [savingCategory, setSavingCategory] = useState(false);

  // Redirect if not a client
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/portal/login");
    } else if (status === "authenticated" && session?.user?.role !== "client") {
      // CPAs should go to their own dashboard
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // Load uploaded docs
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "client") {
      fetch("/api/portal/upload")
        .then((r) => r.json())
        .then((data) => setDocs(Array.isArray(data) ? data : []))
        .finally(() => setDocsLoading(false));

      fetch("/api/portal/document-requests")
        .then((r) => r.json())
        .then((data) => setDocRequests(Array.isArray(data) ? data : []))
        .catch(() => setDocRequests([]))
        .finally(() => setRequestsLoading(false));
    }
  }, [status, session]);

  async function markRequestDone(requestId: string) {
    setFulfillingId(requestId);
    try {
      const res = await fetch(`/api/portal/document-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "fulfilled" }),
      });
      if (res.ok) {
        setDocRequests((prev) =>
          prev.map((r) => r.id === requestId ? { ...r, status: "fulfilled" } : r)
        );
      }
    } finally {
      setFulfillingId(null);
    }
  }

  async function saveCategory(docId: string) {
    setSavingCategory(true);
    try {
      const res = await fetch(`/api/portal/upload/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: editingCategory }),
      });
      if (res.ok) {
        setDocs((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, category: editingCategory } : d))
        );
        setEditingDocId(null);
      }
    } finally {
      setSavingCategory(false);
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      setUploading(true);
      setUploadError("");
      setUploadSuccess([]);

      const uploaded: string[] = [];

      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);
        if (note) formData.append("note", note);

        try {
          const res = await fetch("/api/portal/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const err = await res.json();
            setUploadError(err.error || `Failed to upload ${file.name}`);
          } else {
            const doc = await res.json();
            setDocs((prev) => [doc, ...prev]);
            uploaded.push(file.name);
          }
        } catch {
          setUploadError(`Upload failed for ${file.name}`);
        }
      }

      setUploading(false);
      if (uploaded.length > 0) {
        setUploadSuccess(uploaded);
        setNote("");
        setTimeout(() => setUploadSuccess([]), 5000);
      }
    },
    [category, note]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    disabled: uploading,
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-forest-600 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "client") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <div>
              <span className="font-bold font-serif text-gray-900">
                CPA <span className="text-forest-600">Loft</span>
              </span>
              <span className="text-gray-400 text-sm ml-2">Client Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{session.user.name}</p>
              <p className="text-xs text-gray-400">{session.user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/portal/login" })}
              className="text-gray-500"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Hello, {session.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Upload your tax documents and financial records directly to your CPA.
          </p>
        </div>

        {/* Document Requests Card */}
        {(requestsLoading || docRequests.length > 0) && (
          <Card className="mb-6 shadow-sm border-orange-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-orange-500" />
                Document Requests from Your CPA
                {docRequests.filter((r) => r.status === "pending").length > 0 && (
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs font-normal ml-auto">
                    {docRequests.filter((r) => r.status === "pending").length} pending
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-12 shimmer rounded-lg" />
                  ))}
                </div>
              ) : docRequests.filter((r) => r.status === "pending").length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  No pending requests — you&apos;re all caught up!
                </div>
              ) : (
                <div className="space-y-2">
                  {docRequests.filter((r) => r.status === "pending").map((request) => (
                    <div key={request.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{request.title}</p>
                        {request.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{request.description}</p>
                        )}
                        {request.dueDate && (
                          <Badge variant="outline" className="text-xs mt-1 border-orange-200 text-orange-600">
                            Due: {new Date(request.dueDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="bg-forest-600 hover:bg-forest-700 shrink-0 text-xs"
                        disabled={fulfillingId === request.id}
                        onClick={() => markRequestDone(request.id)}
                      >
                        {fulfillingId === request.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Mark Done
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upload Card */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-forest-600" />
              Upload Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category + Note */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Document type</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Note for your CPA (optional)</Label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Q3 expenses, 2023 W-2"
                />
              </div>
            </div>

            {/* Drop zone */}
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                isDragActive
                  ? "border-forest-600 bg-forest-50 scale-[1.01]"
                  : uploading
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                  : "border-gray-200 hover:border-forest-300 hover:bg-forest-50/40"
              )}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-10 h-10 text-forest-600 animate-spin" />
                  <p className="text-sm text-gray-500">Uploading…</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-forest-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-forest-600" />
                  </div>
                  <p className="font-medium text-gray-800 mb-1">
                    {isDragActive ? "Drop files here" : "Drag & drop your files here"}
                  </p>
                  <p className="text-sm text-gray-400 mb-3">
                    or click to browse — PDF, Excel, Word, Images (max 10MB)
                  </p>
                  <Button variant="outline" size="sm" type="button">
                    Browse Files
                  </Button>
                </>
              )}
            </div>

            {/* Success banner */}
            {uploadSuccess.length > 0 && (
              <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-lg p-3">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <div className="text-sm text-green-700">
                  <strong>Uploaded successfully!</strong>
                  <ul className="mt-1 space-y-0.5">
                    {uploadSuccess.map((name) => (
                      <li key={name} className="text-green-600 text-xs">
                        ✓ {name}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-green-500 mt-1">
                    Your CPA has been notified and can view these files.
                  </p>
                </div>
              </div>
            )}

            {/* Error banner */}
            {uploadError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <p className="text-sm text-red-700 flex-1">{uploadError}</p>
                <button onClick={() => setUploadError("")}>
                  <X className="w-4 h-4 text-red-400 hover:text-red-600" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Uploaded docs history */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Your Uploaded Documents</span>
              <Badge variant="outline" className="text-xs font-normal">
                {docs.length} file{docs.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 shimmer rounded-lg" />
                ))}
              </div>
            ) : docs.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm text-gray-500">No documents uploaded yet</p>
                <p className="text-xs mt-1">
                  Use the area above to send files to your CPA
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {doc.originalName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                          <span>{formatBytes(doc.size)}</span>
                          <span>·</span>
                          <span>{formatRelativeDate(doc.createdAt)}</span>
                        </div>
                      </div>
                      {editingDocId === doc.id ? null : (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="outline" className="text-xs capitalize">
                            {CATEGORIES.find((c) => c.value === doc.category)?.label.split(" ").slice(1).join(" ") || doc.category}
                          </Badge>
                          <button
                            onClick={() => {
                              setEditingDocId(doc.id);
                              setEditingCategory(doc.category);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Change document type"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Inline category editor */}
                    {editingDocId === doc.id && (
                      <div className="mt-2 ml-12 flex items-center gap-2">
                        <Select value={editingCategory} onValueChange={setEditingCategory}>
                          <SelectTrigger className="h-8 text-xs flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c.value} value={c.value} className="text-xs">
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <button
                          onClick={() => saveCategory(doc.id)}
                          disabled={savingCategory}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-forest-600 hover:bg-forest-700 text-white transition-colors shrink-0 disabled:opacity-50"
                          title="Save"
                        >
                          {savingCategory ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingDocId(null)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors shrink-0"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          Files you upload are securely shared with your CPA only.
          <br />
          Need help? Contact your CPA directly.
        </p>
      </main>
    </div>
  );
}
