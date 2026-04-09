"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  FileText,
  MoreHorizontal,
  Trash2,
  Edit2,
  Loader2,
  User,
  Link2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Send,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials, formatRelativeDate } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  taxId?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  portalEnabled: boolean;
  portalUserId?: string | null;
  _count: { documents: number };
}

const statusColors: Record<string, string> = {
  active: "success",
  inactive: "secondary",
  pending: "warning",
};

function ClientForm({
  client,
  onSave,
  onClose,
}: {
  client?: Client | null;
  onSave: (data: Partial<Client>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    company: client?.company || "",
    taxId: client?.taxId || "",
    notes: client?.notes || "",
    status: client?.status || "pending",
  });
  const [saving, setSaving] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>Full Name *</Label>
          <Input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="John Smith"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="john@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <Label>Company / Entity</Label>
          <Input
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            placeholder="Acme Corp"
          />
        </div>
        <div className="space-y-2">
          <Label>Tax ID / EIN / SSN</Label>
          <Input
            value={form.taxId}
            onChange={(e) => update("taxId", e.target.value)}
            placeholder="XX-XXXXXXX"
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => update("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Notes</Label>
          <Input
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Additional notes..."
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-forest-600 hover:bg-forest-700"
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {client ? "Save Changes" : "Add Client"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [inviteClient, setInviteClient] = useState<Client | null>(null);
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function saveClient(data: Partial<Client>) {
    if (editClient) {
      await fetch(`/api/clients/${editClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setClients((prev) =>
        prev.map((c) => (c.id === editClient.id ? { ...c, ...data } : c))
      );
    } else {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const newClient = await res.json();
      setClients((prev) => [{ ...newClient, _count: { documents: 0 } }, ...prev]);
    }
    setShowModal(false);
    setEditClient(null);
  }

  const [inviteEmailSent, setInviteEmailSent] = useState(false);

  async function generateInvite(client: Client) {
    setInviteClient(client);
    setInviteUrl("");
    setInviteEmailSent(false);
    setInviteLoading(true);
    try {
      const res = await fetch("/api/portal/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteUrl(data.inviteUrl);
        setInviteEmailSent(Boolean(data.emailSent));
        setClients((prev) =>
          prev.map((c) => c.id === client.id ? { ...c, portalEnabled: true } : c)
        );
      }
    } finally {
      setInviteLoading(false);
    }
  }

  async function copyInviteUrl() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function resendInvite(client: Client) {
    setResendingId(client.id);
    try {
      const res = await fetch("/api/clients/resend-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id }),
      });
      if (res.ok) {
        setResendSuccess(client.id);
        setTimeout(() => setResendSuccess(null), 3000);
      }
    } finally {
      setResendingId(null);
    }
  }

  async function deleteClient(id: string) {
    if (!confirm("Delete this client and all their documents?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  const filtered = clients.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = clients.filter((c) => c.status === "active").length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCount} active · {clients.length} total
          </p>
        </div>
        <Button
          onClick={() => {
            setEditClient(null);
            setShowModal(true);
          }}
          className="bg-forest-600 hover:bg-forest-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Clients", value: clients.length, icon: Users, color: "text-forest-600", bg: "bg-forest-50" },
          { label: "Active", value: activeCount, icon: User, color: "text-green-600", bg: "bg-green-50" },
          {
            label: "Pending",
            value: clients.filter((c) => c.status === "pending").length,
            icon: Users,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 shimmer rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="w-14 h-14 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-gray-500">No clients found</p>
              <p className="text-sm mt-1">
                {search
                  ? "Try a different search"
                  : "Add your first client to get started"}
              </p>
              {!search && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                      Client
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                      Contact
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                      Documents
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                      Added
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setViewClient(client)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-forest-600 text-white text-xs font-semibold">
                              {getInitials(client.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {client.name}
                            </div>
                            {client.company && (
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {client.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          {client.email && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </div>
                          )}
                          {client.phone && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            (statusColors[client.status] as "success" | "warning" | "secondary") ||
                            "outline"
                          }
                          className="capitalize text-xs"
                        >
                          {client.status}
                        </Badge>
                        {client.portalUserId ? (
                          <Badge variant="success" className="text-xs ml-1.5">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Portal
                          </Badge>
                        ) : client.portalEnabled ? (
                          <Badge variant="warning" className="text-xs ml-1.5">
                            Invited
                          </Badge>
                        ) : null}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FileText className="w-4 h-4 text-gray-400" />
                          {client._count.documents}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-400">
                        {formatRelativeDate(client.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditClient(client);
                                setShowModal(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Client
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                generateInvite(client);
                              }}
                            >
                              {client.portalUserId ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                  Portal Active · Re-invite
                                </>
                              ) : (
                                <>
                                  <Link2 className="w-4 h-4 mr-2" />
                                  Invite to Client Portal
                                </>
                              )}
                            </DropdownMenuItem>
                            {client.email && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resendInvite(client);
                                }}
                                disabled={resendingId === client.id}
                              >
                                {resendingId === client.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending…
                                  </>
                                ) : resendSuccess === client.id ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                    Invite Sent!
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Resend Invite Email
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteClient(client.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Client Modal */}
      <Dialog
        open={showModal}
        onOpenChange={(o) => {
          if (!o) {
            setShowModal(false);
            setEditClient(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editClient ? "Edit Client" : "Add New Client"}
            </DialogTitle>
          </DialogHeader>
          <ClientForm
            client={editClient}
            onSave={saveClient}
            onClose={() => {
              setShowModal(false);
              setEditClient(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Client Details Modal */}
      {viewClient && (
        <Dialog open onOpenChange={() => setViewClient(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Client Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-forest-600 text-white text-xl font-bold">
                    {getInitials(viewClient.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {viewClient.name}
                  </h3>
                  <Badge
                    variant={
                      (statusColors[viewClient.status] as "success" | "warning" | "secondary") ||
                      "outline"
                    }
                    className="capitalize text-xs mt-1"
                  >
                    {viewClient.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {viewClient.company && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-0.5">Company</p>
                    <p className="font-medium flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {viewClient.company}
                    </p>
                  </div>
                )}
                {viewClient.email && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <p className="font-medium flex items-center gap-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {viewClient.email}
                    </p>
                  </div>
                )}
                {viewClient.phone && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {viewClient.phone}
                    </p>
                  </div>
                )}
                {viewClient.taxId && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Tax ID</p>
                    <p className="font-medium text-mono">{viewClient.taxId}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Documents</p>
                  <p className="font-medium flex items-center gap-1">
                    <FileText className="w-4 h-4 text-gray-400" />
                    {viewClient._count.documents} files
                  </p>
                </div>
              </div>

              {viewClient.notes && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    {viewClient.notes}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditClient(viewClient);
                  setViewClient(null);
                  setShowModal(true);
                }}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={() => setViewClient(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Invite to Portal Modal */}
      {inviteClient && (
        <Dialog open onOpenChange={() => { setInviteClient(null); setInviteUrl(""); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-forest-600" />
                Invite Client to Portal
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Client info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-forest-600 text-white font-semibold text-sm">
                    {getInitials(inviteClient.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{inviteClient.name}</p>
                  {inviteClient.email && (
                    <p className="text-xs text-gray-500">{inviteClient.email}</p>
                  )}
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-forest-50 rounded-lg p-3 text-sm text-forest-700 space-y-1">
                <p className="font-medium">How it works:</p>
                <ul className="text-xs text-forest-600 space-y-1 list-disc pl-4">
                  <li>Share this link with your client via email or message</li>
                  <li>They create a password and access their secure portal</li>
                  <li>They can upload documents directly to you</li>
                  <li>All uploads appear in your Documents page</li>
                </ul>
              </div>

              {inviteLoading ? (
                <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin text-forest-600" />
                  <span className="text-sm">Generating secure invite link…</span>
                </div>
              ) : inviteUrl ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Invite Link (expires in 7 days)
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                    <input
                      readOnly
                      value={inviteUrl}
                      className="flex-1 text-xs text-gray-700 bg-transparent outline-none truncate"
                    />
                    <button
                      onClick={copyInviteUrl}
                      className="shrink-0 p-1.5 rounded hover:bg-gray-200 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Copied to clipboard!
                    </p>
                  )}
                  <a
                    href={inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-forest-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Preview portal link
                  </a>
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setInviteClient(null); setInviteUrl(""); }}>
                Close
              </Button>
              {inviteUrl && (
                <Button
                  className="bg-forest-600 hover:bg-forest-700"
                  onClick={copyInviteUrl}
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
