import type { ContactLead } from "@/lib/types";

export async function notifyLead(lead: Pick<ContactLead, "name" | "email" | "message">, toEmail?: string | null) {
  if (!toEmail || !process.env.EMAIL_PROVIDER || !process.env.EMAIL_API_KEY) {
    console.warn("Lead saved without email notification: provider is not configured.");
    return { sent: false };
  }
  console.warn(`Email provider ${process.env.EMAIL_PROVIDER} is configured but no adapter implementation is active yet.`);
  return { sent: false, lead };
}
