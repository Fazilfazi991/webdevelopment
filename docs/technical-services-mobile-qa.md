# Technical Services Mobile QA

Status: code fix complete; authenticated browser QA remains blocked without a real signed-in Technical Services Modern site in this session.

## Root Causes

| Area | Issue found | Fix applied | QA status |
| --- | --- | --- | --- |
| Mobile preview viewport | Template sections used viewport media queries inside fixed-width preview panes. On a desktop browser, `md:` and `lg:` grids still applied inside a 390px preview pane. | Replaced section grids with intrinsic `auto-fit/minmax(min(100%, ...), 1fr)` layouts and removed transform hints from preview panes. | Typecheck passed. Browser route QA requires authenticated site. |
| Text wrapping | Cards and columns could become too narrow while desktop columns stayed active, making headings appear one letter per line. | Added `min-w-0`, normal overflow wrapping, and break-word only on text blocks that need it. Avoided `word-break: break-all` in renderer text. | Static audit passed for renderer sections. |
| Service grids | Service highlights and service cards could stay in multi-column layouts inside mobile preview panes. | Service highlights, services grid, why choose us, gallery, testimonials, about, hero, contact, and footer now respond to available content width. | Typecheck passed. |
| Uploaded media | Media merging matched only broad usage types, so one `service` or `gallery` image could be applied loosely and exact slots could not be targeted. | Added `resolveSiteMediaSlot()`, exact service/gallery slot keys, and broad-slot fallback support. | Typecheck passed. |
| Published media | Published snapshots could contain expired signed URLs. | Public loader refreshes signed URLs from snapshot storage paths at request time before rendering. Draft media remains isolated until republish because the public site still reads the last published snapshot. | Typecheck passed. |

## Slot Mapping

| Uploaded image slot | Default fallback |
| --- | --- |
| `logo` | No logo image renderer yet; text logo remains. |
| `hero` | `/templates/technical-services-modern/hero.webp` |
| `about` | `/templates/technical-services-modern/about.webp` |
| `service:ac-maintenance` | `/templates/technical-services-modern/services/ac-maintenance.webp` |
| `service:electrical` | `/templates/technical-services-modern/services/electrical.webp` |
| `service:plumbing` | `/templates/technical-services-modern/services/plumbing.webp` |
| `service:painting` | `/templates/technical-services-modern/services/painting.webp` |
| `service:interior-repairs` | `/templates/technical-services-modern/services/interior-repairs.webp` |
| `service:preventive-maintenance` | `/templates/technical-services-modern/services/preventive-maintenance.webp` |
| `gallery:project-01` | `/templates/technical-services-modern/projects/project-01.webp` |
| `gallery:project-02` | `/templates/technical-services-modern/projects/project-02.webp` |
| `gallery:project-03` | `/templates/technical-services-modern/projects/project-03.webp` |
| `gallery:project-04` | `/templates/technical-services-modern/projects/project-04.webp` |
| `favicon` | Browser default until favicon rendering is added. |

Broad legacy slots `service` and `gallery` are still accepted as fallbacks, but exact slots win when present.

## Route Behaviour

| Route | Uploaded media behaviour | Fallback behaviour | Status |
| --- | --- | --- | --- |
| `/dashboard/websites/[siteId]/setup/templates/[templateId]` | Uses default assets before selection. Once the same template is selected, merges site uploaded media. | Template defaults remain visible when no upload exists. | Code fixed; auth route QA blocked. |
| `/dashboard/websites/[siteId]/editor` | Uses `loadEditorContext()` and slot-aware media merge. | Template defaults remain visible when no upload exists. | Code fixed; auth route QA blocked. |
| `/dashboard/websites/[siteId]/preview` | Uses the same editor context and slot-aware media merge. | Template defaults remain visible when no upload exists. | Code fixed; auth route QA blocked. |
| `/dashboard/websites/[siteId]/preview/[pageSlug]` | Uses the same full preview shell. | Template defaults remain visible when no upload exists. | Code fixed; auth route QA blocked. |
| `/sites/[subdomain]` | Uses last published snapshot only, then refreshes signed URLs from that snapshot. | Snapshot template defaults remain visible when no published upload exists. | Code fixed; published route QA blocked without published subdomain. |

## Responsive Matrix

| Section | 1440 | 1024 | 768 | 430 | 390 | 320 | Fix applied |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Header | Expected desktop wrap | Expected wrap | Expected wrap | Stacked/wrapped | Stacked/wrapped | Stacked/wrapped | `min-w-0`, wrapped nav/company text |
| Hero | Two columns when room exists | Auto-fit | Auto-fit | Single column | Single column | Single column | Intrinsic grid, button stack, text guards |
| Service Highlights | Auto-fit | Auto-fit | Auto-fit | Single column | Single column | Single column | Intrinsic cards |
| Services Grid | Auto-fit 3-ish columns | Auto-fit | Auto-fit | Single column | Single column | Single column | Intrinsic cards |
| About | Auto-fit | Auto-fit | Auto-fit | Single column | Single column | Single column | Intrinsic image/text grid |
| Why Choose Us | Auto-fit | Auto-fit | Auto-fit | Single column | Single column | Single column | Intrinsic cards |
| Projects Gallery | Auto-fit | Auto-fit | Auto-fit | Single column | Single column | Single column | Intrinsic gallery |
| Testimonials | Auto-fit | Auto-fit | Auto-fit | Single column | Single column | Single column | Intrinsic cards |
| FAQ | Readable | Readable | Readable | Readable | Readable | Readable | Text guards |
| Contact | Auto-fit | Auto-fit | Auto-fit | Single column | Single column | Single column | Intrinsic form/map grid |
| Footer | Auto-fit | Auto-fit | Auto-fit | Stacked | Stacked | Stacked | Intrinsic footer grid |
| Floating WhatsApp | Visible | Visible | Visible | Inside viewport | Inside viewport | Inside viewport | `max-width: calc(100% - 2rem)` |

## Verification Notes

- `npm.cmd run typecheck`: passed.
- Authenticated visual QA at 430px, 390px, and 320px still needs a real signed-in browser session with a Technical Services Modern site.
- Supabase MCP was not used.
- No authentication, agency permissions, AI logic, billing, homepage, or unrelated route changes were made.
