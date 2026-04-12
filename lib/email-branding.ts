import { db } from "@/lib/db";
import { getAppUrl } from "@/lib/utils";

export interface EmailBranding {
  logoUrl: string | null;
  displayName: string | null;
}

/**
 * Returns the email branding (logo URL + display name) for a CPA user.
 * Only premium-plan users get custom branding; all others return null values.
 * The logoUrl is an absolute URL pointing to the public logo proxy endpoint
 * (/api/logo/[userId]) so email clients can load the image without auth.
 */
export async function getEmailBranding(
  userId: string,
  plan: string
): Promise<EmailBranding> {
  if (plan !== "premium") {
    return { logoUrl: null, displayName: null };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { firmLogo: true, portalDisplayName: true },
  });

  return {
    logoUrl: user?.firmLogo ? `${getAppUrl()}/api/logo/${userId}` : null,
    displayName: user?.portalDisplayName || null,
  };
}
