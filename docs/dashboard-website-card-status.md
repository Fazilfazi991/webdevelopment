# Dashboard Website Card Status

The dashboard derives customer-facing website card states in `getWebsiteCardState()`.

## Supported States

| State | Customer label | Meaning |
| --- | --- | --- |
| `setup_incomplete` | Setup incomplete | Category or business basics are not ready. |
| `design_required` | Design needed | Category exists but no renderable template is selected. |
| `ready_to_review` | Website ready for review | A recommended design is prepared and should be reviewed. |
| `ready_to_publish` | Ready to publish | The website has a renderable design and can go live. |
| `published_synced` | Live and up to date | The live site is published and no newer draft update is detected. |
| `published_with_changes` | Unpublished changes | The live site is online, but the draft appears newer. |
| `unpublished` | Website offline | The site was previously published and is now offline. |
| `suspended` | Suspended | The website is blocked from normal publishing actions. |

## Draft Change Approximation

The current schema does not store an exact draft hash versus published snapshot hash. Until that exists, the dashboard uses this safe approximation:

```text
site.updated_at > site.published_at
```

When true, the card shows `Unpublished changes` and offers `Publish Updates`. The live public website remains unchanged until publishing creates a new version snapshot.

## Action Rules

- Incomplete sites show one `Continue Setup` action.
- Legacy category-without-template sites show `Prepare Recommended Design`.
- Template browsing is optional and labelled `Choose Another Design` during onboarding or `Change Design` on dashboard cards.
- Publish address editing is inside the publish panel, not permanently visible on every card.
- Published synced sites do not show `Republish`; they show live status and live/draft preview actions.
