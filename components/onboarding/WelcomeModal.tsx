"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Brain,
  CalendarClock,
  Globe,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: <Users className="w-5 h-5 text-forest-600" />,
    title: "Client Management",
    desc: "Organise all your clients, notes, and activity in one place.",
  },
  {
    icon: <FileText className="w-5 h-5 text-forest-600" />,
    title: "Document Hub",
    desc: "Upload, categorise, and share documents with clients securely.",
  },
  {
    icon: <CalendarClock className="w-5 h-5 text-forest-600" />,
    title: "Tax Deadlines",
    desc: "Track filing deadlines per client with automated reminders.",
  },
  {
    icon: <Globe className="w-5 h-5 text-forest-600" />,
    title: "Client Portal",
    desc: "Give each client their own secure space to upload and review docs.",
  },
  {
    icon: <Brain className="w-5 h-5 text-forest-600" />,
    title: "AI Assistant",
    desc: "Ask tax questions, analyse documents, and draft client emails with AI.",
  },
];

interface WelcomeModalProps {
  userName: string;
  onDismiss: () => void;
}

export default function WelcomeModal({ userName, onDismiss }: WelcomeModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  function close() {
    setOpen(false);
    onDismiss();
  }

  function goToChecklist() {
    close();
    router.push("/dashboard/getting-started");
  }

  const firstName = userName?.split(" ")[0] ?? "there";

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-forest-700 to-forest-900 px-8 py-7 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-xs font-semibold uppercase tracking-widest text-forest-200">
              Welcome to CPA Loft
            </span>
          </div>
          <h2 className="text-2xl font-bold leading-tight">
            Hi {firstName}, glad you&apos;re here!
          </h2>
          <p className="text-forest-200 text-sm mt-2 leading-relaxed">
            Your all-in-one CPA practice platform. Here&apos;s a quick overview
            of what you can do.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="px-8 py-5 space-y-3">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-8 pb-7 pt-2 flex items-center gap-3">
          <Button
            className="flex-1 bg-forest-700 hover:bg-forest-800 text-white"
            onClick={goToChecklist}
          >
            Start Setup Checklist
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="ghost" className="text-gray-500" onClick={close}>
            Explore on my own
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
