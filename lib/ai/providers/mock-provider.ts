import type { AiProvider, AiProviderInput, AiProviderResult } from "@/lib/ai/types";
import { estimateTokens } from "@/lib/ai/safety";

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export class MockAiProvider implements AiProvider {
  name = "mock";

  isConfigured() {
    return true;
  }

  async generate(input: AiProviderInput): Promise<AiProviderResult> {
    const profile = (input.payload.profile ?? {}) as Record<string, unknown>;
    const businessName = text(profile.business_name, "Horizon Technical Services");
    const services = Array.isArray(profile.services) && profile.services.length ? profile.services.map(String) : ["AC Maintenance", "Electrical Repairs", "Plumbing Support"];
    const currentValue = text(input.payload.currentValue, "");

    const output = ["rewrite", "shorten", "grammar_fix", "translation"].includes(input.requestType)
      ? { value: input.requestType === "shorten" ? currentValue.slice(0, 120) || `${businessName} provides reliable support.` : `${currentValue || `${businessName} provides reliable support for homes and businesses.`}` }
      : {
          businessProfile: {
            companyName: businessName,
            tagline: "Reliable service with clear communication",
            shortDescription: `${businessName} helps customers get practical, professional support without unnecessary delays.`,
            fullDescription: `${businessName} provides dependable service for customers who want clear communication, careful workmanship, and straightforward support from enquiry to completion.`
          },
          hero: {
            heading: `Reliable ${text(profile.business_type, "Business")} Services`,
            description: `Practical support for customers in ${text(profile.primary_location, "your area")}, delivered with professional care.`,
            primaryCtaLabel: text(profile.cta_preference, "Request a Quote"),
            secondaryCtaLabel: "View Services"
          },
          about: {
            heading: `About ${businessName}`,
            description: `${businessName} focuses on dependable service, transparent communication, and work that is easy for customers to understand and approve.`,
            bullets: ["Clear estimates", "Responsive support", "Professional follow-through"]
          },
          services: services.slice(0, 6).map((service) => ({
            title: service,
            description: `Professional ${service.toLowerCase()} support tailored to the customer's needs.`
          })),
          whyChooseUs: [
            { title: "Clear communication", description: "Customers know what is happening before work begins." },
            { title: "Practical recommendations", description: "Suggestions stay focused on the right next step." },
            { title: "Reliable follow-through", description: "The team keeps commitments visible and manageable." }
          ],
          faq: [
            { question: "How do customers request support?", answer: "Customers can send an enquiry and the team will respond with the next steps." },
            { question: "Which areas are covered?", answer: `Service is available in ${text(profile.primary_location, "the listed service areas")}.` }
          ],
          cta: {
            title: "Ready to discuss your project?",
            body: "Send an enquiry and the team will help you choose the right next step.",
            primaryAction: { label: text(profile.cta_preference, "Request a Quote"), href: "#contact" }
          },
          seo: {
            title: `${businessName} | Professional Services`,
            description: `${businessName} provides practical, professional service support for homes and businesses.`,
            ogTitle: `${businessName} Services`,
            ogDescription: "Professional support with clear communication and reliable follow-through.",
            keywords: services.slice(0, 6)
          },
          recommendedSections: [
            { sectionKey: "services-card-grid", reason: "Services are central to the customer's decision." },
            { sectionKey: "faq-accordion", reason: "FAQs reduce uncertainty before enquiry." },
            { sectionKey: "contact-map-form", reason: "A clear contact path supports lead collection." }
          ],
          imageChecklist: [
            { slot: "Logo", requirement: "1 transparent PNG or SVG." },
            { slot: "Hero image", requirement: "1 landscape image, minimum 1600 x 900." },
            { slot: "Service images", requirement: "Up to 6 images, minimum 800 x 600." }
          ]
        };

    return {
      output,
      tokensInput: estimateTokens(input.payload),
      tokensOutput: estimateTokens(output),
      estimatedCost: 0,
      provider: this.name,
      model: input.model
    };
  }
}
