"use client";

import { useState } from "react";
import { DashboardSidebar } from "./sidebar";
import { DashboardHeader } from "./header";

interface ShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    plan: string;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: ShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <DashboardSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          user={user}
          onMenuClick={() => setMobileOpen((o) => !o)}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
