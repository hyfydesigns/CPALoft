"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  FileText,
  Users,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Upload,
  Plus,
  Clock,
  Zap,
  Eye,
  ImageIcon,
  FileSpreadsheet,
  FileArchive,
  Mail,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatRelativeDate, formatBytes, PLANS } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalClients: number;
    activeClients: number;
    totalDocuments: number;
    totalChats: number;
    aiUsageThisMonth: number;
  };
  recentDocuments: Array<{
    id: string;
    name: string;
    originalName: string;
    type: string;
    size: number;
    url: string;
    category: string;
    createdAt: string;
    client?: { name: string } | null;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    updatedAt: string;
    messages: Array<{ content: string }>;
  }>;
}

type PreviewDoc = {
  id: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  createdAt: string;
};

function getFileIcon(type: string) {
  if (type === "pdf") return <FileText className="w-5 h-5 text-red-500" />;
  if (type === "image") return <ImageIcon className="w-5 h-5 text-purple-500" />;
  if (type === "spreadsheet") return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  return <FileArchive className="w-5 h-5 text-gray-500" />;
}

function DocPreviewModal({ doc, onClose, isPremium }: { doc: PreviewDoc; onClose: () => void; isPremium: boolean }) {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);

  async function analyzeWithAI() {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}/analyze`, { method: "POST" });
      if (res.ok) {
        const { chatId } = await res.json();
        onClose();
        router.push(`/dashboard/ai-assistant?chat=${chatId}`);
      }
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3 min-w-0">
            {getFileIcon(doc.type)}
            <div className="min-w-0">
              <DialogTitle className="text-base truncate">{doc.originalName}</DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatBytes(doc.size)} · {formatRelativeDate(doc.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {isPremium && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-forest-300 text-forest-700 hover:bg-forest-50"
                onClick={analyzeWithAI}
                disabled={analyzing}
              >
                {analyzing ? (
                  <Brain className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Brain className="w-3.5 h-3.5 mr-1.5" />
                )}
                {analyzing ? "Opening…" : "Analyze with AI"}
              </Button>
            )}
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
              {getFileIcon(doc.type)}
              <p className="text-gray-600">Preview not available for this file type</p>
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

const quickActions = [
  {
    href: "/dashboard/ai-assistant",
    icon: Brain,
    label: "Ask AI",
    description: "Get instant tax answers",
    color: "bg-forest-600",
    premium: false,
  },
  {
    href: "/dashboard/documents",
    icon: Upload,
    label: "Upload Doc",
    description: "Add new document",
    color: "bg-purple-600",
    premium: false,
  },
  {
    href: "/dashboard/clients",
    icon: Plus,
    label: "Add Client",
    description: "New client profile",
    color: "bg-green-600",
    premium: false,
  },
  {
    href: "#",
    icon: Mail,
    label: "Practice Digest",
    description: "Email practice summary",
    color: "bg-teal-600",
    premium: true,
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeToast, setUpgradeToast] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PreviewDoc | null>(null);
  const [digestSending, setDigestSending] = useState(false);

  async function sendDigest() {
    setDigestSending(true);
    try {
      await fetch("/api/digest", { method: "POST" });
      setUpgradeToast("📧 Digest sent to your email!");
      setTimeout(() => setUpgradeToast(null), 6000);
    } finally {
      setDigestSending(false);
    }
  }

  const isPremium = session?.user?.plan === "premium";

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));

    // Show success toast if redirected here after a plan upgrade
    const params = new URLSearchParams(window.location.search);
    const upgraded = params.get("upgraded");
    if (upgraded) {
      setUpgradeToast(`🎉 You're now on the ${upgraded.charAt(0).toUpperCase() + upgraded.slice(1)} plan!`);
      // Clean up URL without reload
      window.history.replaceState({}, "", "/dashboard");
      setTimeout(() => setUpgradeToast(null), 6000);
    }
  }, []);

  const plan = PLANS[(session?.user?.plan as keyof typeof PLANS) || "free"];
  const aiUsed = data?.stats?.aiUsageThisMonth || 0;
  const aiLimit = plan.aiMessages === -1 ? 100 : plan.aiMessages;
  const aiPercent = plan.aiMessages === -1 ? 10 : Math.min((aiUsed / aiLimit) * 100, 100);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {upgradeToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium bg-green-600 text-white">
          {upgradeToast}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {session?.user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening in your practice today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Clients",
            value: loading ? "—" : data?.stats?.totalClients,
            sub: `${data?.stats?.activeClients || 0} active`,
            icon: Users,
            color: "text-forest-600",
            bg: "bg-forest-50",
            href: "/dashboard/clients",
          },
          {
            label: "Documents",
            value: loading ? "—" : data?.stats?.totalDocuments,
            sub: "uploaded",
            icon: FileText,
            color: "text-purple-600",
            bg: "bg-purple-50",
            href: "/dashboard/documents",
          },
          {
            label: "AI Chats",
            value: loading ? "—" : data?.stats?.totalChats,
            sub: "conversations",
            icon: MessageSquare,
            color: "text-green-600",
            bg: "bg-green-50",
            href: "/dashboard/ai-assistant",
          },
          {
            label: "AI Usage",
            value: loading ? "—" : `${aiUsed}`,
            sub: plan.aiMessages === -1 ? "unlimited" : `of ${aiLimit} this month`,
            icon: Brain,
            color: "text-orange-600",
            bg: "bg-orange-50",
            href: "/dashboard/ai-assistant",
          },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-0.5">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500">
                  {stat.label} · {stat.sub}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const isDigest = action.label === "Practice Digest";
              const isLocked = action.premium && !isPremium;

              if (isDigest && isPremium) {
                return (
                  <button
                    key="digest"
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-left"
                    onClick={sendDigest}
                    disabled={digestSending}
                  >
                    <div className={`w-9 h-9 ${action.color} rounded-lg flex items-center justify-center`}>
                      {digestSending ? (
                        <Brain className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <action.icon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{action.label}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                );
              }

              if (isLocked) {
                return (
                  <Link key={action.label} href="/dashboard/billing">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer opacity-60">
                      <div className="w-9 h-9 bg-gray-400 rounded-lg flex items-center justify-center">
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                          {action.label}
                          <Lock className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="text-xs text-gray-500">{action.description}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                );
              }

              return (
                <Link key={action.href} href={action.href}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className={`w-9 h-9 ${action.color} rounded-lg flex items-center justify-center`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{action.label}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* AI Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              AI Usage This Month
              <Badge
                variant={session?.user?.plan === "premium" ? "default" : "info"}
                className="text-xs"
              >
                {plan.name} Plan
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Messages used</span>
                  <span className="font-semibold">
                    {aiUsed} / {plan.aiMessages === -1 ? "∞" : aiLimit}
                  </span>
                </div>
                <Progress value={aiPercent} className="h-2" />
                {plan.aiMessages !== -1 && aiPercent > 75 && (
                  <p className="text-xs text-orange-600 mt-1.5 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {Math.round(100 - aiPercent)}% remaining — consider upgrading
                  </p>
                )}
              </div>

              {session?.user?.plan !== "premium" && (
                <Link href="/dashboard/billing">
                  <Button className="w-full bg-gradient-to-r from-forest-600 to-forest-700 hover:opacity-90 transition-opacity text-sm">
                    <Zap className="w-4 h-4 mr-1.5" />
                    Upgrade for More
                  </Button>
                </Link>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="font-semibold text-gray-800 text-sm">
                    {plan.clients === -1 ? "∞" : plan.clients}
                  </div>
                  <div>clients allowed</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="font-semibold text-gray-800 text-sm">
                    {plan.storage}
                  </div>
                  <div>storage</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent AI Chats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              Recent AI Chats
              <Link href="/dashboard/ai-assistant">
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  View all
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 shimmer rounded-lg" />
                ))}
              </div>
            ) : data?.recentActivity?.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No chats yet. Ask the AI something!
              </div>
            ) : (
              <div className="space-y-2">
                {data?.recentActivity?.slice(0, 4).map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/dashboard/ai-assistant?chat=${chat.id}`}
                  >
                    <div className="p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {chat.title}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatRelativeDate(chat.updatedAt)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {previewDoc && (
        <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} isPremium={isPremium} />
      )}

      {/* Recent Documents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center justify-between">
            Recent Documents
            <Link href="/dashboard/documents">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                View all
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 shimmer rounded-lg" />
              ))}
            </div>
          ) : data?.recentDocuments?.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No documents yet.</p>
              <Link href="/dashboard/documents">
                <Button variant="outline" size="sm" className="mt-3">
                  Upload your first document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data?.recentDocuments?.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setPreviewDoc(doc)}
                  className="flex items-center gap-4 py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {doc.originalName}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span>{formatBytes(doc.size)}</span>
                      {doc.client && (
                        <>
                          <span>·</span>
                          <span>{doc.client.name}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{formatRelativeDate(doc.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {doc.type.toUpperCase()}
                    </Badge>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-forest-50 transition-all"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4 text-forest-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
