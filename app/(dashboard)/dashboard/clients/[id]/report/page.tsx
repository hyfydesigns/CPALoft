"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, FileText, ImageIcon, FileSpreadsheet, FileArchive } from "lucide-react";
import Link from "next/link";
import { formatBytes } from "@/lib/utils";

interface ClientData {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  taxId?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
}

interface Document {
  id: string;
  originalName: string;
  type: string;
  size: number;
  category: string;
  createdAt: string;
}

interface TaxDeadline {
  id: string;
  label: string;
  dueDate: string;
  status: string;
}

interface DocumentRequest {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: string;
}

interface ClientNote {
  id: string;
  content: string;
  pinned: boolean;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  type: string;
  label: string;
  createdAt: string;
}

interface ReportData {
  client: ClientData;
  documents: Document[];
  deadlines: TaxDeadline[];
  activity: ActivityLog[];
  requests: DocumentRequest[];
  notes: ClientNote[];
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  pending: "bg-amber-100 text-amber-700",
};

const deadlineStatusColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  overdue: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
};

function getFileIcon(type: string) {
  if (type === "pdf") return <FileText className="w-4 h-4 text-red-500" />;
  if (type === "image") return <ImageIcon className="w-4 h-4 text-purple-500" />;
  if (type === "spreadsheet") return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
  return <FileArchive className="w-4 h-4 text-gray-500" />;
}

export default function ClientReportPage() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/clients/${params.id}/report`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setReport(data);
        }
      })
      .catch(() => setError("Failed to load report"))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading report…</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-500 text-sm">{error || "Report unavailable"}</div>
      </div>
    );
  }

  const { client, documents, deadlines, activity, requests, notes } = report;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-page { padding: 0; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 print-page">
        {/* Toolbar (no-print) */}
        <div className="no-print bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/dashboard/clients" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Clients
            </Link>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8 bg-white shadow-sm my-6 rounded-xl print:shadow-none print:my-0 print:rounded-none">

          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[client.status] || "bg-gray-100 text-gray-600"}`}>
                    {client.status}
                  </span>
                  {client.company && (
                    <span className="text-sm text-gray-600">{client.company}</span>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-gray-400">
                <p>Report generated</p>
                <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {client.email && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                  <p className="text-sm text-gray-700">{client.email}</p>
                </div>
              )}
              {client.phone && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
                  <p className="text-sm text-gray-700">{client.phone}</p>
                </div>
              )}
              {client.taxId && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Tax ID</p>
                  <p className="text-sm text-gray-700">{client.taxId}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Client Since</p>
                <p className="text-sm text-gray-700">
                  {new Date(client.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Documents ({documents.length})
            </h2>
            {documents.length === 0 ? (
              <p className="text-sm text-gray-400">No documents uploaded.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-400 uppercase tracking-wide">
                    <th className="pb-2 font-medium">File Name</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium">Size</th>
                    <th className="pb-2 font-medium">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-100">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          {getFileIcon(doc.type)}
                          <span className="truncate max-w-[200px]">{doc.originalName}</span>
                        </div>
                      </td>
                      <td className="py-2 text-gray-500 capitalize">{doc.type}</td>
                      <td className="py-2 text-gray-500 capitalize">{doc.category}</td>
                      <td className="py-2 text-gray-500">{formatBytes(doc.size)}</td>
                      <td className="py-2 text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Deadlines */}
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Tax Deadlines ({deadlines.length})
            </h2>
            {deadlines.length === 0 ? (
              <p className="text-sm text-gray-400">No deadlines.</p>
            ) : (
              <div className="space-y-1.5">
                {deadlines.map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{d.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {new Date(d.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${deadlineStatusColors[d.status] || "bg-gray-100 text-gray-600"}`}>
                        {d.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Document Requests */}
          {requests.filter((r) => r.status === "pending").length > 0 && (
            <section className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Pending Document Requests ({requests.filter((r) => r.status === "pending").length})
              </h2>
              <div className="space-y-2">
                {requests.filter((r) => r.status === "pending").map((r) => (
                  <div key={r.id} className="p-3 rounded-lg border border-amber-100 bg-amber-50">
                    <p className="text-sm font-medium text-gray-800">{r.title}</p>
                    {r.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                    )}
                    {r.dueDate && (
                      <p className="text-xs text-amber-700 mt-1">
                        Due: {new Date(r.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          {notes.length > 0 && (
            <section className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Notes ({notes.length})
              </h2>
              <div className="space-y-2">
                {notes.map((note) => (
                  <div key={note.id} className={`p-3 rounded-lg border ${note.pinned ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-gray-50"}`}>
                    {note.pinned && (
                      <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">Pinned · </span>
                    )}
                    <p className="text-sm text-gray-700 inline">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Activity */}
          {activity.length > 0 && (
            <section className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Recent Activity (last {Math.min(activity.length, 15)} entries)
              </h2>
              <div className="relative">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />
                <div className="space-y-3 ml-7">
                  {activity.slice(0, 15).map((log) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-5 w-2 h-2 rounded-full bg-forest-400 mt-1.5" />
                      <p className="text-sm text-gray-700">{log.label}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
            <p>Generated by CPA Loft · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
        </div>
      </div>
    </>
  );
}
