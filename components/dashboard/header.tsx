"use client";

import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { Bell, LogOut, Settings, User, CreditCard, Zap, Menu } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    plan: string;
  };
  onMenuClick?: () => void;
}

const planColors: Record<string, string> = {
  free: "bg-forest-50 text-forest-600",
  pro: "bg-forest-600 text-cloud",
  premium: "bg-midnight text-mint",
};

export function DashboardHeader({ user, onMenuClick }: HeaderProps) {
  const initials = getInitials(user.name || user.email || "U");

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Breadcrumb placeholder - pages fill this */}
        <div id="header-title" className="flex items-center gap-3" />
      </div>

      <div className="flex items-center gap-3">
        {/* Upgrade CTA for free users */}
        {user.plan === "free" && (
          <Link href="/dashboard/billing">
            <button className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-forest-600 to-forest-700 text-white px-3 py-1.5 rounded-full font-medium hover:opacity-90 transition-opacity">
              <Zap className="w-3.5 h-3.5" />
              Upgrade to Pro
            </button>
          </Link>
        )}

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-forest-600 rounded-full" />
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full focus:outline-none">
            <Avatar className="w-9 h-9">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="bg-forest-600 text-white text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-sm truncate">
                  {user.name || "Your Account"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
                <div className="mt-1">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${planColors[user.plan] || planColors.free}`}
                  >
                    {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}{" "}
                    Plan
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/billing" className="cursor-pointer">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing & Plans
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
