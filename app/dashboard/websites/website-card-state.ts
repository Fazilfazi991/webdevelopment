import type { BusinessCategory, Industry, Site, SiteTemplateSelection, Template } from "@/lib/types";

export type WebsiteCardStateKey =
  | "setup_incomplete"
  | "design_required"
  | "ready_to_review"
  | "ready_to_publish"
  | "published_synced"
  | "published_with_changes"
  | "unpublished"
  | "suspended";

export type WebsiteCardState = {
  state: WebsiteCardStateKey;
  badge: string;
  title: string;
  description: string;
  primaryAction: "continue_setup" | "prepare_recommended" | "preview" | "edit" | "view_details";
  showPublicUrl: boolean;
  showPublishAction: boolean;
  showPreviewAction: boolean;
  showLiveAction: boolean;
  showChangeDesign: boolean;
  publishLabel: "Publish Website" | "Publish Updates" | "Publish Website Again" | null;
  previewLabel: "Preview Website" | "Preview Draft" | null;
};

export function hasUnpublishedChanges(site: Site) {
  if (!site.published_at) return false;
  return new Date(site.updated_at).getTime() > new Date(site.published_at).getTime();
}

export function getWebsiteCardState({
  site,
  selection,
  category,
  template
}: {
  site: Site;
  selection?: SiteTemplateSelection | null;
  industry?: Industry | null;
  category?: BusinessCategory | null;
  template?: Template | null;
}): WebsiteCardState {
  if (site.status === "suspended" || site.publication_status === "suspended") {
    return {
      state: "suspended",
      badge: "Suspended",
      title: "Website suspended",
      description: "This website is temporarily unavailable. Contact support for assistance.",
      primaryAction: "view_details",
      showPublicUrl: false,
      showPublishAction: false,
      showPreviewAction: false,
      showLiveAction: false,
      showChangeDesign: false,
      publishLabel: null,
      previewLabel: null
    };
  }

  const hasCategory = Boolean(selection?.business_category_id && category);
  const hasTemplate = Boolean(selection?.template_id && template);

  if (!hasCategory) {
    return {
      state: "setup_incomplete",
      badge: "Setup incomplete",
      title: "Complete your business basics",
      description: "Add your business category so we can prepare a matching website design.",
      primaryAction: "continue_setup",
      showPublicUrl: false,
      showPublishAction: false,
      showPreviewAction: false,
      showLiveAction: false,
      showChangeDesign: false,
      publishLabel: null,
      previewLabel: null
    };
  }

  if (!hasTemplate) {
    return {
      state: "design_required",
      badge: "Design needed",
      title: "Prepare a recommended design",
      description: "Choose a design or let the platform prepare the recommended design for this business.",
      primaryAction: "prepare_recommended",
      showPublicUrl: false,
      showPublishAction: false,
      showPreviewAction: false,
      showLiveAction: false,
      showChangeDesign: true,
      publishLabel: null,
      previewLabel: null
    };
  }

  if (site.publication_status === "unpublished" && site.last_published_version_id) {
    return {
      state: "unpublished",
      badge: "Website offline",
      title: "Website offline",
      description: "Your content is saved, but your website is not publicly visible.",
      primaryAction: "edit",
      showPublicUrl: false,
      showPublishAction: true,
      showPreviewAction: true,
      showLiveAction: false,
      showChangeDesign: true,
      publishLabel: "Publish Website Again",
      previewLabel: "Preview Draft"
    };
  }

  if (site.publication_status === "published") {
    const changed = hasUnpublishedChanges(site);
    return {
      state: changed ? "published_with_changes" : "published_synced",
      badge: changed ? "Unpublished changes" : "Live and up to date",
      title: changed ? "Unpublished changes" : "Live site is up to date",
      description: changed
        ? "Your live website is still online. Publish your latest edits when ready."
        : "Your public website is live and matches the latest saved version.",
      primaryAction: "edit",
      showPublicUrl: true,
      showPublishAction: changed,
      showPreviewAction: true,
      showLiveAction: true,
      showChangeDesign: true,
      publishLabel: changed ? "Publish Updates" : null,
      previewLabel: "Preview Draft"
    };
  }

  if (site.setup_step === "template_selected") {
    return {
      state: "ready_to_review",
      badge: "Website ready for review",
      title: "Website ready for review",
      description: "We prepared a design that matches your business.",
      primaryAction: "preview",
      showPublicUrl: false,
      showPublishAction: false,
      showPreviewAction: true,
      showLiveAction: false,
      showChangeDesign: true,
      publishLabel: null,
      previewLabel: "Preview Website"
    };
  }

  return {
    state: "ready_to_publish",
    badge: "Ready to publish",
    title: "Ready to publish",
    description: "Your website is prepared and ready to go live.",
    primaryAction: "edit",
    showPublicUrl: false,
    showPublishAction: true,
    showPreviewAction: true,
    showLiveAction: false,
    showChangeDesign: true,
    publishLabel: "Publish Website",
    previewLabel: "Preview Draft"
  };
}
