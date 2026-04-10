"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  X,
  ArrowRight,
} from "lucide-react";

export const ONBOARDING_STEPS = [
  {
    id: "profile",
    label: "Complete your firm profile",
    description: "Add your firm name, phone number, and licence number.",
    href: "/dashboard/settings",
  },
  {
    id: "client",
    label: "Add your first client",
    description: "Create a client record to start managing their documents and deadlines.",
    href: "/dashboard/clients",
  },
  {
    id: "document",
    label: "Upload a document",
    description: "Upload a PDF or other file and assign it to a client.",
    href: "/dashboard/documents",
  },
  {
    id: "deadline",
    label: "Set a tax deadline",
    description: "Create a deadline for a client and enable reminders.",
    href: "/dashboard/tax-deadlines",
  },
  {
    id: "portal",
    label: "Invite a client to their portal",
    description: "Enable the client portal so they can securely upload docs.",
    href: "/dashboard/clients",
  },
  {
    id: "ai",
    label: "Try the AI Assistant",
    description: "Ask a tax question or analyse a client document with AI.",
    href: "/dashboard/ai-assistant",
  },
];

const STORAGE_KEY = "cpaloft_onboarding_steps";

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

interface OnboardingChecklistProps {
  onComplete: () => void;
}

export default function OnboardingChecklist({ onComplete }: OnboardingChecklistProps) {
  const [completed, setCompleted] = useState<Set<string>>(() => loadSteps());
  const [collapsed, setCollapsed] = useState(false);

  const doneCount = ONBOARDING_STEPS.filter((s) => completed.has(s.id)).length;
  const total = ONBOARDING_STEPS.length;
  const pct = Math.round((doneCount / total) * 100);

  function toggle(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveSteps(next);
      return next;
    });
  }

  async function dismiss() {
    await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    onComplete();
  }

  return (
    <div className="bg-white border border-forest-200 rounded-xl shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-forest-50 transition-colors"
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0">
            <div className="relative w-9 h-9">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="#2d6a4f" strokeWidth="3"
                  strokeDasharray={`${(pct / 100) * 94} 94`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-forest-700">
                {pct}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Getting Started</p>
            <p className="text-xs text-gray-500">{doneCount} of {total} steps completed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/getting-started"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-forest-700 hover:underline font-medium hidden sm:block"
          >
            View full guide
          </Link>
          {collapsed
            ? <ChevronDown className="w-4 h-4 text-gray-400" />
            : <ChevronUp className="w-4 h-4 text-gray-400" />
          }
        </div>
      </div>

      {/* Steps */}
      {!collapsed && (
        <div className="border-t border-gray-100">
          {ONBOARDING_STEPS.map((step, i) => {
            const done = completed.has(step.id);
            return (
              <div
                key={step.id}
                className={`flex items-start gap-3 px-5 py-3 border-b border-gray-50 last:border-b-0 ${
                  done ? "bg-gray-50/50" : ""
                }`}
              >
                <button
                  onClick={() => toggle(step.id)}
                  className="mt-0.5 shrink-0 text-forest-600 hover:text-forest-800 transition-colors"
                  title={done ? "Mark incomplete" : "Mark complete"}
                >
                  {done
                    ? <CheckCircle2 className="w-5 h-5" />
                    : <Circle className="w-5 h-5 text-gray-300" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${done ? "line-through text-gray-400" : "text-gray-800"}`}>
                    {i + 1}. {step.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                </div>
                {!done && (
                  <Link href={step.href} className="shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4 text-forest-500 hover:text-forest-700" />
                  </Link>
                )}
              </div>
            );
          })}

          {/* Footer */}
          <div className="px-5 py-3 bg-gray-50 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              You can always access this from{" "}
              <Link href="/dashboard/getting-started" className="text-forest-600 hover:underline">
                Getting Started
              </Link>
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-gray-400 hover:text-gray-600 gap-1"
              onClick={dismiss}
            >
              <X className="w-3 h-3" /> Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
