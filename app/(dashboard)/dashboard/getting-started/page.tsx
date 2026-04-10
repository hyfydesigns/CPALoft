"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  BookOpen,
  Download,
  Users,
  FileText,
  Brain,
  CalendarClock,
  Globe,
  Settings,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { ONBOARDING_STEPS } from "@/components/onboarding/OnboardingChecklist";

const STORAGE_KEY = "cpaloft_onboarding_steps";

const SECTIONS = [
  {
    id: "clients",
    icon: <Users className="w-5 h-5" />,
    color: "bg-blue-50 text-blue-700",
    title: "Client Management",
    steps: [
      {
        title: "Add your first client",
        detail:
          "Go to Clients → New Client. Enter their name, email, tax ID, and company. You can add notes and track their full activity history.",
        href: "/dashboard/clients",
        label: "Go to Clients",
      },
      {
        title: "Invite a client to their portal",
        detail:
          'Open a client record and click "Enable Portal". They\'ll receive an email invitation with a secure link to upload documents and view their files.',
        href: "/dashboard/clients",
        label: "Manage Clients",
      },
    ],
  },
  {
    id: "documents",
    icon: <FileText className="w-5 h-5" />,
    color: "bg-red-50 text-red-700",
    title: "Documents",
    steps: [
      {
        title: "Upload and categorise documents",
        detail:
          "Go to Documents → Upload. Select a file, choose a category (Tax Return, W-2, Invoice, etc.), and assign it to a client. Supports PDF, Word, Excel, and images.",
        href: "/dashboard/documents",
        label: "Go to Documents",
      },
      {
        title: "Request documents from clients",
        detail:
          'Use Document Requests to ask clients for specific files. They\'ll see the request in their portal and can upload directly. Go to a client\'s profile → "Request Document".',
        href: "/dashboard/clients",
        label: "Go to Clients",
      },
    ],
  },
  {
    id: "deadlines",
    icon: <CalendarClock className="w-5 h-5" />,
    color: "bg-orange-50 text-orange-700",
    title: "Tax Deadlines",
    steps: [
      {
        title: "Create a tax deadline",
        detail:
          "Go to Tax Deadlines → New Deadline. Set the client, label (e.g. Q1 Estimated Tax), and due date. Enable reminders to get notified before it's due.",
        href: "/dashboard/tax-deadlines",
        label: "Go to Deadlines",
      },
      {
        title: "Use deadline templates (Pro)",
        detail:
          "Create reusable sets of deadlines (e.g. Annual Filing Package) and apply them to any client in one click. Go to Settings → Deadline Templates.",
        href: "/dashboard/settings",
        label: "Go to Settings",
      },
    ],
  },
  {
    id: "ai",
    icon: <Brain className="w-5 h-5" />,
    color: "bg-purple-50 text-purple-700",
    title: "AI Assistant",
    steps: [
      {
        title: "Ask a tax question",
        detail:
          "Go to AI Assistant and type any tax or accounting question. You can save useful prompts for quick reuse and review your full conversation history.",
        href: "/dashboard/ai-assistant",
        label: "Open AI Assistant",
      },
      {
        title: "Analyse a document with AI (Premium)",
        detail:
          "Open any PDF from the Documents page, click \"Analyse with AI\", and the AI will extract the text, summarise it, highlight key figures, and flag anything unusual.",
        href: "/dashboard/documents",
        label: "Go to Documents",
      },
    ],
  },
  {
    id: "portal",
    icon: <Globe className="w-5 h-5" />,
    color: "bg-teal-50 text-teal-700",
    title: "Client Portal",
    steps: [
      {
        title: "Enable and customise the portal",
        detail:
          "Each client gets a personal portal link. Premium users can add a firm logo and custom display name via Settings → Branding so the portal reflects your firm.",
        href: "/dashboard/settings",
        label: "Go to Settings",
      },
    ],
  },
  {
    id: "settings",
    icon: <Settings className="w-5 h-5" />,
    color: "bg-gray-100 text-gray-700",
    title: "Account & Settings",
    steps: [
      {
        title: "Complete your firm profile",
        detail:
          "Go to Settings and fill in your firm name, phone number, and CPA licence number. This information may appear on client-facing reports.",
        href: "/dashboard/settings",
        label: "Go to Settings",
      },
      {
        title: "Upgrade your plan",
        detail:
          "Free plan includes core features. Pro adds document requests, deadline templates, and bulk exports. Premium adds AI document analysis, custom branding, and practice digest emails.",
        href: "/dashboard/billing",
        label: "View Plans",
      },
    ],
  },
];

function loadSteps(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSteps(steps: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...steps]));
}

export default function GettingStartedPage() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCompleted(loadSteps());
    setMounted(true);
  }, []);

  function toggle(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveSteps(next);
      return next;
    });
  }

  const doneCount = mounted ? ONBOARDING_STEPS.filter((s) => completed.has(s.id)).length : 0;
  const total = ONBOARDING_STEPS.length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-forest-600 text-sm font-medium mb-1">
          <Sparkles className="w-4 h-4" />
          Onboarding
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Getting Started with CPA Loft</h1>
        <p className="text-gray-500 mt-1">
          Work through the checklist below, then explore the guides to get the most out of the platform.
        </p>
      </div>

      {/* Quick checklist */}
      <div className="bg-white border border-forest-200 rounded-xl shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Setup Checklist</h2>
            <p className="text-xs text-gray-500 mt-0.5">{doneCount} of {total} completed</p>
          </div>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-forest-600 h-2 rounded-full transition-all"
              style={{ width: `${(doneCount / total) * 100}%` }}
            />
          </div>
        </div>
        {ONBOARDING_STEPS.map((step, i) => {
          const done = mounted && completed.has(step.id);
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 px-6 py-3 border-b border-gray-50 last:border-b-0 ${done ? "bg-gray-50/50" : ""}`}
            >
              <button
                onClick={() => toggle(step.id)}
                className="shrink-0 text-forest-600 hover:text-forest-800 transition-colors"
              >
                {done
                  ? <CheckCircle2 className="w-5 h-5" />
                  : <Circle className="w-5 h-5 text-gray-300" />}
              </button>
              <span className={`flex-1 text-sm ${done ? "line-through text-gray-400" : "text-gray-700"}`}>
                {i + 1}. {step.label}
              </span>
              {!done && (
                <Link href={step.href}>
                  <ArrowRight className="w-4 h-4 text-forest-500 hover:text-forest-700" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Reference guides download banner */}
      <div className="bg-gradient-to-r from-forest-700 to-forest-900 rounded-xl px-6 py-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-white">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-forest-200" />
            <span className="text-xs font-semibold uppercase tracking-widest text-forest-200">Reference Guides</span>
          </div>
          <p className="font-semibold">Printable training documents</p>
          <p className="text-forest-200 text-sm mt-0.5">
            Download or print a full platform guide for yourself or your team.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Link href="/resources/cpa-guide" target="_blank">
            <Button size="sm" variant="secondary" className="w-full sm:w-auto gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Solo CPA Guide
            </Button>
          </Link>
          <Link href="/resources/team-guide" target="_blank">
            <Button size="sm" variant="secondary" className="w-full sm:w-auto gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Team Training Guide
            </Button>
          </Link>
        </div>
      </div>

      {/* Detailed walk-through sections */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Walk-through</h2>
      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <div key={section.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${section.color}`}>
                {section.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{section.title}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {section.steps.map((step, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 mb-1">{step.title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.detail}</p>
                    </div>
                    <Link
                      href={step.href}
                      className="shrink-0 flex items-center gap-1 text-xs text-forest-600 hover:text-forest-800 font-medium mt-0.5 whitespace-nowrap"
                    >
                      {step.label} <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Help link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">
          Need more help?{" "}
          <Link href="/help" className="text-forest-600 hover:underline font-medium">
            Visit the Help Centre
          </Link>
        </p>
      </div>
    </div>
  );
}
