import { db } from "./db";

export async function logActivity(args: {
  clientId: string;
  userId: string;
  type: string;
  label: string;
  metadata?: Record<string, unknown>;
}) {
  await db.activityLog.create({
    data: {
      clientId: args.clientId,
      userId: args.userId,
      type: args.type,
      label: args.label,
      metadata: args.metadata ? JSON.stringify(args.metadata) : null,
    },
  });
}
