/**
 * Per-AE links and metadata for the v8 setup screen.
 * Use ?ae=<slug> on /demo-console/v8 (e.g. ?ae=jordan).
 */

export type AeResourceKind = "case-study" | "recording" | "deck" | "one-pager" | "calendar" | "crm" | "custom"

export interface AeResource {
  id: string
  kind: AeResourceKind
  label: string
  description: string
  href: string
}

export type AePreviousDemoType = "discovery" | "deep-dive" | "follow-up" | "executive"

export interface AePreviousDemo {
  id: string
  title: string
  /** Dealership or prospect name */
  account: string
  /** Human-readable date for the recording */
  recordedAt: string
  /** e.g. "18 min" */
  duration: string
  href: string
  type?: AePreviousDemoType
}

export interface AeDemoKit {
  id: string
  /** Shown in the setup sidebar */
  displayName: string
  /** Short line under the name */
  territory?: string
  /** Loom / Gong / Drive links to past console demos */
  previousDemos: AePreviousDemo[]
  /** Decks, one-pagers, case studies, etc. */
  resources: AeResource[]
}

const PLACEHOLDER = "https://example.com"

export const AE_DEMO_KITS: Record<string, AeDemoKit> = {
  jordan: {
    id: "jordan",
    displayName: "Jordan Kim",
    territory: "Southwest enterprise",
    previousDemos: [
      {
        id: "pd-1",
        title: "Full console walkthrough",
        account: "Desert Valley Auto Group",
        recordedAt: "Mar 18, 2026",
        duration: "24 min",
        href: `${PLACEHOLDER}/ae/jordan/demos/desert-valley-full`,
        type: "deep-dive",
      },
      {
        id: "pd-2",
        title: "Inventory audit + X-Ray teaser",
        account: "Sunrise Motors",
        recordedAt: "Mar 6, 2026",
        duration: "14 min",
        href: `${PLACEHOLDER}/ae/jordan/demos/sunrise-teaser`,
        type: "discovery",
      },
      {
        id: "pd-3",
        title: "CFO + VP Digital — ROI block",
        account: "Highland Automotive",
        recordedAt: "Feb 22, 2026",
        duration: "31 min",
        href: `${PLACEHOLDER}/ae/jordan/demos/highland-executive`,
        type: "executive",
      },
      {
        id: "pd-4",
        title: "Transform + go-live pacing",
        account: "Caprock CDJR",
        recordedAt: "Feb 4, 2026",
        duration: "19 min",
        href: `${PLACEHOLDER}/ae/jordan/demos/caprock-transform`,
        type: "follow-up",
      },
    ],
    resources: [
      {
        id: "cs",
        kind: "case-study",
        label: "Case study",
        description: "Desert Valley — 34% faster time-to-live",
        href: `${PLACEHOLDER}/ae/jordan/case-study`,
      },
      {
        id: "deck",
        kind: "deck",
        label: "Pitch deck",
        description: "Q1 merchandising narrative",
        href: `${PLACEHOLDER}/ae/jordan/deck`,
      },
      {
        id: "1p",
        kind: "one-pager",
        label: "One-pager",
        description: "ROI + holding cost snapshot",
        href: `${PLACEHOLDER}/ae/jordan/one-pager`,
      },
      {
        id: "cal",
        kind: "calendar",
        label: "Book follow-up",
        description: "Jordan’s calendar",
        href: `${PLACEHOLDER}/ae/jordan/calendar`,
      },
    ],
  },
  alex: {
    id: "alex",
    displayName: "Alex Rivera",
    territory: "Mid-market independents",
    previousDemos: [
      {
        id: "pd-1",
        title: "Agency vs in-house photo ops",
        account: "Lone Star Pre-Owned",
        recordedAt: "Mar 14, 2026",
        duration: "16 min",
        href: `${PLACEHOLDER}/ae/alex/demos/lone-star-agency`,
        type: "discovery",
      },
      {
        id: "pd-2",
        title: "Smart Match + no-photo VINs",
        account: "River City Autos",
        recordedAt: "Mar 2, 2026",
        duration: "11 min",
        href: `${PLACEHOLDER}/ae/alex/demos/river-city-smart-match`,
        type: "deep-dive",
      },
      {
        id: "pd-3",
        title: "Quick win — 3-rooftop rollup",
        account: "Family Auto Group",
        recordedAt: "Jan 28, 2026",
        duration: "22 min",
        href: `${PLACEHOLDER}/ae/alex/demos/family-auto-rollup`,
        type: "follow-up",
      },
    ],
    resources: [
      {
        id: "cs",
        kind: "case-study",
        label: "Case study",
        description: "3-rooftop group — agency → in-house",
        href: `${PLACEHOLDER}/ae/alex/case-study`,
      },
      {
        id: "crm",
        kind: "crm",
        label: "CRM notes template",
        description: "Copy-paste discovery fields",
        href: `${PLACEHOLDER}/ae/alex/crm-template`,
      },
      {
        id: "deck",
        kind: "deck",
        label: "Talk track",
        description: "Objection handling sheet",
        href: `${PLACEHOLDER}/ae/alex/talk-track`,
      },
    ],
  },
  default: {
    id: "default",
    displayName: "AE workspace",
    territory: "Add ?ae=jordan or ?ae=alex for a named kit",
    previousDemos: [
      {
        id: "pd-1",
        title: "Standard product tour (v8)",
        account: "Internal enablement",
        recordedAt: "Mar 2026",
        duration: "21 min",
        href: `${PLACEHOLDER}/resources/demos/v8-tour`,
        type: "deep-dive",
      },
      {
        id: "pd-2",
        title: "Discovery → console handoff",
        account: "Enablement library",
        recordedAt: "Feb 2026",
        duration: "12 min",
        href: `${PLACEHOLDER}/resources/demos/discovery-handoff`,
        type: "discovery",
      },
      {
        id: "pd-3",
        title: "ROI + holding-cost narrative",
        account: "RevOps snippet",
        recordedAt: "Jan 2026",
        duration: "8 min",
        href: `${PLACEHOLDER}/resources/demos/roi-snippet`,
        type: "executive",
      },
    ],
    resources: [
      {
        id: "cs",
        kind: "case-study",
        label: "Case study library",
        description: "Spyne customer stories",
        href: `${PLACEHOLDER}/resources/case-studies`,
      },
      {
        id: "deck",
        kind: "deck",
        label: "Standard deck",
        description: "Latest merchandising deck",
        href: `${PLACEHOLDER}/resources/deck`,
      },
      {
        id: "archive",
        kind: "custom",
        label: "All recordings",
        description: "Folder of past demos",
        href: `${PLACEHOLDER}/resources/demos`,
      },
    ],
  },
}

export function resolveAeKit(slug: string | null | undefined): AeDemoKit {
  if (!slug) return AE_DEMO_KITS.default
  const key = slug.trim().toLowerCase()
  return AE_DEMO_KITS[key] ?? AE_DEMO_KITS.default
}

export const V8_DEMO_STORAGE_KEY = (aeId: string) => `spyne-v8-demo:${aeId}`
