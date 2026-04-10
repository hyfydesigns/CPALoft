import { NextResponse } from "next/server";
export function requirePro(plan: string) {
  if (plan === "free") {
    return NextResponse.json(
      { error: "This feature requires a Pro or Premium plan. Upgrade in Billing & Plans." },
      { status: 403 }
    );
  }
  return null;
}
