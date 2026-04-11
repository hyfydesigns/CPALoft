import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(date: Date | string) {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(date);
}

export function truncate(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

export function getFileIcon(type: string) {
  if (type.includes("pdf")) return "📄";
  if (type.includes("image")) return "🖼️";
  if (type.includes("spreadsheet") || type.includes("excel")) return "📊";
  if (type.includes("word") || type.includes("document")) return "📝";
  return "📎";
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    aiMessages: 10,
    documents: 5,
    clients: 3,
    storage: "100 MB",
  },
  pro: {
    name: "Pro",
    price: 49,
    aiMessages: 500,
    documents: 100,
    clients: 50,
    storage: "10 GB",
  },
  premium: {
    name: "Premium",
    price: 149,
    aiMessages: -1, // unlimited
    documents: -1,
    clients: -1,
    storage: "100 GB",
  },
} as const;

export type PlanType = keyof typeof PLANS;

/** Returns an error string if the user is over their plan limit, or null if OK. */
export function checkPlanLimit(
  resource: "clients" | "documents",
  plan: string,
  currentCount: number
): string | null {
  const limits = PLANS[plan as PlanType] ?? PLANS.free;
  const limit = limits[resource] as number;
  if (limit === -1) return null; // unlimited
  if (currentCount >= limit) {
    const planName = limits.name;
    const limitLabel = resource === "clients" ? "clients" : "documents";
    return `You've reached the ${planName} plan limit of ${limit} ${limitLabel}. Upgrade your plan to add more.`;
  }
  return null;
}

/** Returns the app base URL with any trailing slash stripped. */
export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  return url.replace(/\/+$/, "");
}
