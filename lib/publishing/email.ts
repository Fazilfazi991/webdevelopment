import type { ContactLead } from "@/lib/types";

export async function notifyLead(lead: Pick<ContactLead, "name" | "email" | "message">, toEmail?: string | null) {
  if (!toEmail || !process.env.EMAIL_PROVIDER || !process.env.EMAIL_API_KEY) {
    console.warn("Lead saved without email notification: provider is not configured.");
    return { sent: false };
  }
  console.warn(`Email provider ${process.env.EMAIL_PROVIDER} is configured but no adapter implementation is active yet.`);
  return { sent: false, lead };
}

export async function notifyAccessEvent(event: string, toEmail?: string | null, detail?: Record<string, unknown>) {
  if (!toEmail || !process.env.EMAIL_PROVIDER || !process.env.EMAIL_API_KEY) {
    console.warn(`Notification saved without email delivery: ${event}. Provider is not configured.`);
    return { sent: false };
  }
  console.warn(`Email provider ${process.env.EMAIL_PROVIDER} is configured but the ${event} adapter is not active yet.`);
  return { sent: false, event, detail };
}
