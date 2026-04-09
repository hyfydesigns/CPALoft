"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Brain,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  CreditCard,
  X,
} from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo, LogoMark } from "@/components/ui/logo";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    exact: true,
  },
  { href: "/dashboard/ai-assistant", icon: Brain, label: "AI Assistant" },
  { href: "/dashboard/documents", icon: FileText, label: "Documents" },
  { href: "/dashboard/clients", icon: Users, label: "Clients" },
];

const bottomItems = [
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/help", icon: HelpCircle, label: "Help & Support" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div
      className={cn(
        "relative flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        // Desktop: always visible, collapsible
        "hidden md:flex",
        collapsed ? "md:w-16" : "md:w-60",
        // Mobile: fixed drawer, slides in/out
        mobileOpen && "flex fixed inset-y-0 left-0 z-30 w-72 md:relative md:z-auto md:w-auto shadow-2xl"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border",
          collapsed && "justify-center px-2"
        )}
      >
        <Logo markSize={28} wordmarkSize="sm" variant="light" className={collapsed ? "hidden" : undefined} />
        {collapsed && <LogoMark size={28} />}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-sidebar-border rounded-full flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-primary hover:text-white transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Main nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {!collapsed && (
          <p className="px-3 mb-2 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">
            Menu
          </p>
        )}
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const content = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                collapsed && "justify-center px-2",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return content;
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-4 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => {
          const active = isActive(item.href);
          const content = (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                collapsed && "justify-center px-2",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return content;
        })}
      </div>
    </div>
  );
}
