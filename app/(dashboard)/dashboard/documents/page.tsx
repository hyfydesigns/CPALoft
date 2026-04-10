"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PLANS } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Eye,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  FileSpreadsheet,
  FileArchive,
  User,
  Tag,
} from "lucide-react";
import { cn, formatBytes, formatRelativeDate } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  category: string;
  createdAt: string;
  client?: { id: string; name: string } | null;
}

interface ClientOption {
  id: string;
  name: string;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "tax", label: "Tax Returns" },
  { value: "financial", label: "Financial Statements" },
  { value: "audit", label: "Audit Reports" },
  { value: "payroll", label: "Payroll" },
  { value: "general", label: "General" },
];

function getFileIcon(type: string, size = 5) {
  const cls = `w-${size} h-${size}`;
  if (type === "pdf") return <FileText className={cn(cls, "text-red-600")} />;
  if (type === "image") return <ImageIcon className={cn(cls, "text-purple-600")} />;
  if (type === "spreadsheet") return <FileSpreadsheet className={cn(cls, "text-green-600")} />;
  return <FileArchive className={cn(cls, "text-forest-600")} />;
}

function PDFPreviewModal({
  doc,
  onClose,
}: {
  doc: Document;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            {getFileIcon(doc.type, 5)}
            <div>
              <DialogTitle className="text-base">{doc.originalName}</DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatBytes(doc.size)} · {formatRelativeDate(doc.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={doc.url}
              download={doc.originalName}
              className="text-sm text-forest-600 hover:underline flex items-center gap-1"
            >
              Download
            </a>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden bg-gray-100">
          {doc.type === "pdf" ? (
            <iframe
              src={`${doc.url}#toolbar=1&navpanes=1`}
              className="w-full h-full"
              title={doc.originalName}
            />
          ) : doc.type === "image" ? (
            <div className="flex items-center justify-center h-full p-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.url}
                alt={doc.originalName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              {getFileIcon(doc.type, 16)}
              <p className="text-gray-600">
                Preview not available for this file type
              </p>
              <a href={doc.url} download={doc.originalName}>
                <Button>Download File</Button>
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [uploadClientId, setUploadClientId] = useState("none");
  const [taggingDoc, setTaggingDoc] = useState<Document | null>(null);
  const [tagClientId, setTagClientId] = useState("none");
  const [tagging, setTagging] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [category, clientFilter]);

  async function loadClients() {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(Array.isArray(data) ? data.map((c: ClientOption) => ({ id: c.id, name: c.name })) : []);
    } catch {}
  }

  async function loadDocuments() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (clientFilter === "none") params.set("clientId", "none");
      else if (clientFilter !== "all") params.set("clientId", clientFilter);
      const res = await fetch(`/api/documents?${params}`);
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);
    setUploadProgress([]);

    const newDocs: Document[] = [];

    for (const file of acceptedFiles) {
      setUploadProgress((prev) => [...prev, `Uploading ${file.name}...`]);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category !== "all" ? category : "general");
        if (uploadClientId !== "none") formData.append("clientId", uploadClientId);

        const res = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          setUploadError(err.error || `Failed to upload ${file.name}`);
        } else {
          const doc = await res.json();
          newDocs.push(doc);
          setUploadProgress((prev) =>
            prev.map((p) =>
              p.includes(file.name) ? `✓ ${file.name} uploaded` : p
            )
          );
        }
      } catch {
        setUploadError(`Upload failed for ${file.name}`);
      }
    }

    setDocuments((prev) => [...newDocs, ...prev]);
    setUploading(false);
    if (newDocs.length > 0) {
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadProgress([]);
      }, 3000);
    }
  }, [category]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  });

  async function tagDocument() {
    if (!taggingDoc) return;
    setTagging(true);
    try {
      const res = await fetch(`/api/documents/${taggingDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: tagClientId === "none" ? null : tagClientId,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDocuments((prev) =>
          prev.map((d) => (d.id === taggingDoc.id ? { ...d, client: updated.client } : d))
        );
        setTaggingDoc(null);
      }
    } finally {
      setTagging(false);
    }
  }

  async function deleteDocument(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  const filtered = documents.filter(
    (d) =>
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.originalName.toLowerCase().includes(search.toLowerCase())
  );

  const plan = PLANS[(session?.user?.plan as keyof typeof PLANS) || "free"];
  const docLimit = plan.documents as number;
  const isOverLimit = docLimit !== -1 && documents.length > docLimit;
  const atLimit = docLimit !== -1 && documents.length >= docLimit;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Over-limit warning banner */}
      {isOverLimit && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <span className="text-lg leading-none">⚠️</span>
          <div>
            <p className="font-semibold">You&apos;re over your {plan.name} plan limit ({docLimit} documents)</p>
            <p className="mt-0.5 text-amber-700">Your existing {documents.length} documents are safe and untouched. You won&apos;t be able to upload new documents until you&apos;re under the limit — upgrade your plan or delete some documents.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 text-sm mt-1">
            Upload and manage your client documents
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {documents.length} files
        </Badge>
      </div>

      {/* Upload Zone */}
      <Card className="mb-6">
        <CardContent className="p-0">
          {/* Client selector for upload */}
          <div className="flex items-center gap-3 px-6 pt-5 pb-0">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600 shrink-0">Tag upload to:</span>
            <Select value={uploadClientId} onValueChange={setUploadClientId}>
              <SelectTrigger className="w-56 h-8 text-sm">
                <SelectValue placeholder="No client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No client (general)</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-forest-600 bg-forest-50"
                : "border-gray-200 hover:border-forest-300 hover:bg-gray-50"
            )}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-forest-600 animate-spin" />
                <div className="space-y-1">
                  {uploadProgress.map((p, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ) : uploadSuccess ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
                <p className="text-sm font-medium text-green-600">
                  Files uploaded successfully!
                </p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-7 h-7 text-forest-600" />
                </div>
                <p className="text-gray-800 font-medium mb-1">
                  {isDragActive
                    ? "Drop files here..."
                    : "Drag & drop files here"}
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  or click to browse — PDF, Excel, Word, Images (max 10MB each)
                </p>
                <Button variant="outline" className="text-sm">
                  Browse Files
                </Button>
              </>
            )}
          </div>
          {uploadError && (
            <div className="flex items-center gap-2 text-red-600 text-sm p-4 border-t border-red-50 bg-red-50/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {uploadError}
              <button onClick={() => setUploadError("")} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            <SelectItem value="none">No Client (General)</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
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

      {/* Documents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 shimmer rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-14 h-14 mx-auto mb-3 opacity-20" />
          <p className="font-medium text-gray-500">No documents found</p>
          <p className="text-sm mt-1">
            {search ? "Try a different search term" : "Upload your first document above"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((doc) => (
            <Card
              key={doc.id}
              className="group hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setPreviewDoc(doc)}
            >
              <CardContent className="p-4">
                {/* File type icon / preview */}
                <div className="w-full h-28 bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden relative">
                  {doc.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={doc.url}
                      alt={doc.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : doc.type === "pdf" ? (
                    <div className="flex flex-col items-center gap-1">
                      <FileText className="w-10 h-10 text-red-500" />
                      <span className="text-xs font-bold text-red-500 uppercase tracking-wide">
                        PDF
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      {getFileIcon(doc.type, 10)}
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        {doc.type}
                      </span>
                    </div>
                  )}
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewDoc(doc);
                      }}
                      className="w-9 h-9 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaggingDoc(doc);
                        setTagClientId(doc.client?.id ?? "none");
                      }}
                      className="w-9 h-9 bg-white rounded-lg flex items-center justify-center hover:bg-forest-50 transition-colors"
                      title="Tag to client"
                    >
                      <Tag className="w-4 h-4 text-forest-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDocument(doc.id);
                      }}
                      className="w-9 h-9 bg-white rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="truncate text-sm font-medium text-gray-800 mb-1">
                  {doc.originalName}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>{formatBytes(doc.size)}</span>
                  <span>{formatRelativeDate(doc.createdAt)}</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 text-xs rounded-md px-2 py-1",
                  doc.client
                    ? "bg-forest-50 text-forest-700"
                    : "bg-gray-100 text-gray-400"
                )}>
                  <User className="w-3 h-3 shrink-0" />
                  <span className="truncate">{doc.client ? doc.client.name : "No client"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* PDF/Image Preview Modal */}
      {previewDoc && (
        <PDFPreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* Tag to Client Modal */}
      {taggingDoc && (
        <Dialog open onOpenChange={() => setTaggingDoc(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-forest-600" />
                Tag Document to Client
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                {getFileIcon(taggingDoc.type, 5)}
                <span className="text-sm font-medium text-gray-800 truncate">
                  {taggingDoc.originalName}
                </span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Assign to client</label>
                <Select value={tagClientId} onValueChange={setTagClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client (general)</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {tagClientId !== "none" && (
                <p className="text-xs text-forest-600 bg-forest-50 rounded-lg p-3">
                  The client will receive an email notification about this document.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setTaggingDoc(null)}>
                Cancel
              </Button>
              <Button
                className="bg-forest-600 hover:bg-forest-700"
                onClick={tagDocument}
                disabled={tagging}
              >
                {tagging ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Tag className="w-4 h-4 mr-2" />
                )}
                Save Tag
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
