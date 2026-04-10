"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarClock,
  Plus,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LayoutTemplate,
  X,
  ChevronRight,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

interface TemplateItem {
  label: string;
  month: number;
  day: number;
  reminderEnabled: boolean;
}

interface Template {
  id: string;
  name: string;
  items: TemplateItem[];
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
}

interface TaxDeadline {
  id: string;
  clientId: string;
  label: string;
  dueDate: string;
  status: string;
  reminderEnabled: boolean;
  notes?: string | null;
  client: { name: string };
}

const COMMON_DEADLINES = ["Form 1040", "Form 1120S", "Form 1065", "Extension"];

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  upcoming: { label: "Upcoming", variant: "warning" },
  overdue: { label: "Overdue", variant: "destructive" },
  completed: { label: "Completed", variant: "success" },
};

export default function DeadlinesPage() {
  const { data: session } = useSession();
  const [deadlines, setDeadlines] = useState<TaxDeadline[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState("");
  const [label, setLabel] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Templates state
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesTab, setTemplatesTab] = useState<"list" | "create">("list");
  const [applyingTemplate, setApplyingTemplate] = useState<Template | null>(null);
  const [applyYear, setApplyYear] = useState(new Date().getFullYear());
  const [applyClientIds, setApplyClientIds] = useState<string[]>([]);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  // Create template form
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateItems, setNewTemplateItems] = useState<TemplateItem[]>([
    { label: "", month: 4, day: 15, reminderEnabled: false },
  ]);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState("");

  const plan = session?.user?.plan || "free";

  useEffect(() => {
    loadDeadlines();
    loadClients();
  }, []);

  async function loadDeadlines() {
    setLoading(true);
    try {
      const res = await fetch("/api/tax-deadlines");
      if (res.ok) {
        const data = await res.json();
        setDeadlines(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadClients() {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(Array.isArray(data) ? data : []);
      }
    } catch {}
  }

  async function addDeadline() {
    if (!selectedClientId || !label || !dueDate) return;
    setAdding(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/tax-deadlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          label,
          dueDate,
          reminderEnabled,
          notes: notes || null,
        }),
      });
      if (res.ok) {
        const deadline = await res.json();
        setDeadlines((prev) => [...prev, deadline].sort(
          (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        ));
        setShowAddDialog(false);
        resetForm();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to add deadline");
      }
    } finally {
      setAdding(false);
    }
  }

  function resetForm() {
    setSelectedClientId("");
    setLabel("");
    setDueDate("");
    setReminderEnabled(false);
    setNotes("");
    setErrorMsg("");
  }

  async function markComplete(id: string) {
    await fetch(`/api/tax-deadlines/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    setDeadlines((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: "completed" } : d)
    );
  }

  async function deleteDeadline(id: string) {
    await fetch(`/api/tax-deadlines/${id}`, { method: "DELETE" });
    setDeadlines((prev) => prev.filter((d) => d.id !== id));
  }

  async function loadTemplates() {
    setTemplatesLoading(true);
    try {
      const res = await fetch("/api/deadline-templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : []);
      }
    } finally {
      setTemplatesLoading(false);
    }
  }

  async function deleteTemplate(id: string) {
    await fetch(`/api/deadline-templates/${id}`, { method: "DELETE" });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  async function saveTemplate() {
    setTemplateError("");
    if (!newTemplateName.trim()) {
      setTemplateError("Template name is required");
      return;
    }
    const validItems = newTemplateItems.filter((i) => i.label.trim());
    if (validItems.length === 0) {
      setTemplateError("At least one item with a label is required");
      return;
    }
    setSavingTemplate(true);
    try {
      const res = await fetch("/api/deadline-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTemplateName, items: validItems }),
      });
      if (res.ok) {
        await loadTemplates();
        setNewTemplateName("");
        setNewTemplateItems([{ label: "", month: 4, day: 15, reminderEnabled: false }]);
        setTemplatesTab("list");
      } else {
        const err = await res.json();
        setTemplateError(err.error || "Failed to save template");
      }
    } finally {
      setSavingTemplate(false);
    }
  }

  async function applyTemplate() {
    if (!applyingTemplate) return;
    setApplying(true);
    setApplySuccess(null);
    try {
      const res = await fetch(`/api/deadline-templates/${applyingTemplate.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientIds: applyClientIds, year: applyYear }),
      });
      if (res.ok) {
        const { created } = await res.json();
        setApplySuccess(`Created ${created} deadline${created !== 1 ? "s" : ""}!`);
        await loadDeadlines();
        setTimeout(() => {
          setApplySuccess(null);
          setApplyingTemplate(null);
          setApplyClientIds([]);
        }, 3000);
      }
    } finally {
      setApplying(false);
    }
  }

  const filtered = deadlines.filter((d) =>
    statusFilter === "all" || d.status === statusFilter
  );

  const counts = {
    all: deadlines.length,
    upcoming: deadlines.filter((d) => d.status === "upcoming").length,
    overdue: deadlines.filter((d) => d.status === "overdue").length,
    completed: deadlines.filter((d) => d.status === "completed").length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-forest-600" />
            Tax Deadlines
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track and manage tax deadlines for all your clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          {plan === "premium" && (
            <Button
              variant="outline"
              onClick={() => {
                setShowTemplates(true);
                setTemplatesTab("list");
                setApplyingTemplate(null);
                loadTemplates();
              }}
            >
              <LayoutTemplate className="w-4 h-4 mr-2" />
              Templates
            </Button>
          )}
          <Button
            className="bg-forest-600 hover:bg-forest-700"
            onClick={() => { resetForm(); setShowAddDialog(true); }}
            disabled={plan === "free"}
            title={plan === "free" ? "Upgrade to Pro to use Tax Deadlines" : undefined}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Deadline
          </Button>
        </div>
      </div>

      {plan === "free" && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <strong>Pro feature:</strong> Tax Deadline Tracker requires a Pro or Premium plan.{" "}
          <a href="/dashboard/billing" className="underline font-medium">Upgrade now →</a>
        </div>
      )}

      {/* Status Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="upcoming">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Upcoming ({counts.upcoming})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Overdue ({counts.overdue})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Completed ({counts.completed})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Deadlines List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 shimmer rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-400">
            <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium text-gray-500">No deadlines found</p>
            <p className="text-sm mt-1">
              {statusFilter === "all" ? "Add your first tax deadline above" : `No ${statusFilter} deadlines`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((deadline) => {
            const isOverdue = deadline.status === "overdue";
            const isCompleted = deadline.status === "completed";
            return (
              <div
                key={deadline.id}
                className={`flex items-center gap-4 p-4 rounded-xl border bg-white transition-colors ${
                  isOverdue ? "border-red-200 border-l-4 border-l-red-500" :
                  isCompleted ? "border-gray-100 opacity-70" :
                  "border-gray-200"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">{deadline.label}</span>
                    <Badge
                      variant={statusConfig[deadline.status]?.variant || "outline"}
                      className="text-xs capitalize"
                    >
                      {statusConfig[deadline.status]?.label || deadline.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{deadline.client.name}</span>
                    <span className="text-gray-300">·</span>
                    <span className={`text-xs font-medium ${isOverdue ? "text-red-600" : "text-gray-600"}`}>
                      {new Date(deadline.dueDate).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{formatRelativeDate(deadline.dueDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markComplete(deadline.id)}
                      className="text-xs h-7 px-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-500" />
                      Done
                    </Button>
                  )}
                  <button
                    onClick={() => deleteDeadline(deadline.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Deadline Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(o) => { setShowAddDialog(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-forest-600" />
              Add Tax Deadline
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <Label>Client *</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Deadline Label *</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Form 1040"
              />
              <div className="flex gap-1.5 flex-wrap">
                {COMMON_DEADLINES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setLabel(d)}
                    className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-forest-300 hover:text-forest-700 hover:bg-forest-50 transition-colors"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reminder"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-forest-600"
              />
              <Label htmlFor="reminder" className="cursor-pointer font-normal">
                Enable reminder emails for this deadline
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-forest-600 hover:bg-forest-700"
              onClick={addDeadline}
              disabled={!selectedClientId || !label || !dueDate || adding}
            >
              {adding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Deadline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
