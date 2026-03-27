"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

type Stage = "website" | "entry" | "intake" | "processing" | "reveal" | "live" | "impact"
type Persona = "ops" | "marketing" | "exec"
type ActiveStage = Exclude<Stage, "entry" | "website">

interface FaqItem {
  id: string
  question: string
  shortAnswer: string
  talkTrack: string[]
  proofPoints: string[]
  relatedFeatureId?: string
}

interface FeatureMetric {
  label: string
  value: string
}

interface FeatureCoverageElements {
  primaryLabel: string
  primaryItems: string[]
  secondaryLabel?: string
  secondaryItems?: string[]
  metrics?: FeatureMetric[]
}

type EntryFlowId =
  | "slow-live"
  | "low-conversion"
  | "see-everything"
  | "manual-edits"
  | "quality-drift"
  | "miss-launch-windows"
  | "post-publish-rework"
  | "data-trust"
  | "prove-roi"

interface FlowStageDefaults {
  faqId: string
  featureId: string
}

interface EntryFlow {
  startStage: ActiveStage
  stageDefaults: Record<ActiveStage, FlowStageDefaults>
  nextStage?: Partial<Record<ActiveStage, ActiveStage>>
}

interface EntryOption {
  id: EntryFlowId
  label: string
  persona: Persona
}

const STAGES_ORDER: ActiveStage[] = ["intake", "processing", "reveal", "live", "impact"]

const FULL_FEATURES: Array<{
  id: string
  label: string
  stage: ActiveStage
}> = [
  { id: "data-prep", label: "Data Preparation", stage: "intake" },
  { id: "upload", label: "Vehicle Upload", stage: "intake" },
  { id: "smart-match", label: "Smart Match", stage: "processing" },
  { id: "ai-enhancements", label: "AI Enhancements", stage: "processing" },
  { id: "shooting-guide", label: "Shooting Guide", stage: "processing" },
  { id: "backgrounds", label: "Backgrounds", stage: "processing" },
  { id: "360-video", label: "360° & Video", stage: "reveal" },
  { id: "media-kit", label: "Media Kit", stage: "reveal" },
  { id: "3d-view", label: "3D View", stage: "reveal" },
  { id: "app-comparison", label: "App vs Traditional", stage: "reveal" },
  { id: "scores", label: "Quality Scores", stage: "reveal" },
  { id: "smart-campaign", label: "Smart Campaign", stage: "live" },
  { id: "publishing", label: "Publishing", stage: "live" },
  { id: "platform-preview", label: "Platform Preview", stage: "live" },
  { id: "smartview", label: "SmartView", stage: "live" },
  { id: "impact", label: "Impact Dashboard", stage: "impact" },
]

const FEATURE_SPOTLIGHTS: Record<string, { title: string; details: string[] }> = {
  "data-prep": {
    title: "Data Preparation",
    details: ["Detects VIN-level gaps before upload.", "Flags missing or inconsistent inventory metadata."],
  },
  upload: {
    title: "Vehicle Upload",
    details: ["Ingests lot media fast.", "Runs instant quality checks on incoming photos."],
  },
  "smart-match": {
    title: "Smart Match",
    details: ["Auto-matches source media to the right car.", "Reduces manual sorting and relabeling."],
  },
  "ai-enhancements": {
    title: "AI Enhancements",
    details: ["Fixes exposure, angle, and visual consistency.", "Applies retail-ready image improvements."],
  },
  "shooting-guide": {
    title: "Shooting Guide",
    details: ["Guides operators toward better first-pass captures.", "Improves upstream media quality over time."],
  },
  backgrounds: {
    title: "Backgrounds",
    details: ["Applies studio-grade or branded environments.", "Keeps visuals consistent across inventory."],
  },
  "360-video": {
    title: "360° & Video",
    details: ["Generates immersive 360 spins.", "Creates short-form video assets automatically."],
  },
  "media-kit": {
    title: "Media Kit",
    details: ["Packages all generated assets per vehicle.", "Makes downstream publishing instant."],
  },
  "3d-view": {
    title: "3D View",
    details: ["Builds a richer interactive view for buyers.", "Increases listing engagement quality."],
  },
  "app-comparison": {
    title: "App vs Traditional",
    details: ["Shows process and speed difference clearly.", "Supports internal buy-in for rollout."],
  },
  scores: {
    title: "Quality Scores",
    details: ["Quantifies media readiness with a single score.", "Highlights where quality still drops."],
  },
  "smart-campaign": {
    title: "Smart Campaign",
    details: ["Creates campaign-ready assets from live inventory.", "Accelerates launch for paid channels."],
  },
  publishing: {
    title: "Publishing",
    details: ["Pushes media and listings to destinations quickly.", "Shortens time-to-live drastically."],
  },
  "platform-preview": {
    title: "Platform Preview",
    details: ["Previews platform-specific output before go-live.", "Reduces post-publish corrections."],
  },
  smartview: {
    title: "SmartView",
    details: ["Shows the listing exactly like buyers see it.", "Helps teams validate final experience."],
  },
  impact: {
    title: "Impact Dashboard",
    details: ["Aggregates time, cost, and performance outcomes.", "Connects capability to business value."],
  },
}

const FEATURE_ICONS: Record<string, string> = {
  "data-prep": "🗂️",
  upload: "📤",
  "smart-match": "🧠",
  "ai-enhancements": "✨",
  "shooting-guide": "📸",
  backgrounds: "🖼️",
  "360-video": "🎥",
  "media-kit": "🧰",
  "3d-view": "🧊",
  "app-comparison": "📱",
  scores: "📊",
  "smart-campaign": "📣",
  publishing: "🚀",
  "platform-preview": "🧪",
  smartview: "👁️",
  impact: "🏆",
}

const FEATURE_VALUE_LINES: Record<string, string> = {
  "data-prep": "reduces setup friction from day one",
  upload: "gets cars in-system without delay",
  "smart-match": "cuts manual matching effort",
  "ai-enhancements": "improves retail readiness automatically",
  "shooting-guide": "improves capture quality over time",
  backgrounds: "keeps listing aesthetics consistent",
  "360-video": "increases buyer engagement depth",
  "media-kit": "makes assets instantly reusable",
  "3d-view": "adds a richer product experience",
  "app-comparison": "makes value obvious to teams",
  scores: "quantifies quality at a glance",
  "smart-campaign": "accelerates marketing launch cycles",
  publishing: "shrinks time-to-live across channels",
  "platform-preview": "catches issues before customers do",
  smartview: "validates buyer-facing output",
  impact: "connects features to business outcomes",
}

const FEATURE_COVERAGE_ELEMENTS: Record<string, FeatureCoverageElements> = {
  "data-prep": {
    primaryLabel: "provider coverage",
    primaryItems: ["CDK", "Reynolds & Reynolds", "DealerSocket", "vAuto", "AutoRaptor", "custom CSV/API"],
    secondaryLabel: "normalization checks",
    secondaryItems: ["VIN decode", "trim + variant mapping", "duplicate stock detection", "price sanity checks"],
    metrics: [
      { label: "providers connected", value: "6+" },
      { label: "records normalized", value: "97%" },
    ],
  },
  upload: {
    primaryLabel: "upload checks",
    primaryItems: ["blur", "under/over exposure", "framing quality", "missing angles"],
    secondaryLabel: "ingestion modes",
    secondaryItems: ["mobile app capture", "bulk desktop upload", "cloud bucket pull"],
    metrics: [
      { label: "checks per image", value: "12" },
      { label: "feedback latency", value: "< 2s" },
    ],
  },
  "smart-match": {
    primaryLabel: "matching signals",
    primaryItems: ["VIN match", "plate OCR", "color profile", "camera angle clustering"],
    secondaryLabel: "resolution outcomes",
    secondaryItems: ["auto-match", "needs review", "duplicate media flagged"],
    metrics: [
      { label: "avg confidence", value: "98.7%" },
      { label: "manual effort cut", value: "70%" },
    ],
  },
  "ai-enhancements": {
    primaryLabel: "enhancement stack",
    primaryItems: ["background removal", "shadow synthesis", "exposure correction", "perspective alignment"],
    secondaryLabel: "consistency controls",
    secondaryItems: ["brand-safe color profile", "noise cleanup", "plate masking"],
    metrics: [
      { label: "fixes applied", value: "8+" },
      { label: "qa pass rate", value: "95%" },
    ],
  },
  "360-video": {
    primaryLabel: "generated outputs",
    primaryItems: ["360 spin", "short video reel", "hero thumbnail set", "story-safe cut"],
    secondaryLabel: "distribution-ready formats",
    secondaryItems: ["VDP embed", "social vertical", "marketplace compliant"],
    metrics: [
      { label: "render turnaround", value: "< 15m" },
      { label: "engagement lift", value: "3.4x" },
    ],
  },
  publishing: {
    primaryLabel: "live destinations",
    primaryItems: ["dealer website", "autotrader", "cars.com", "meta marketplace", "google vehicle ads"],
    secondaryLabel: "publish controls",
    secondaryItems: ["one-click push", "channel-specific mapping", "rollback + republish"],
    metrics: [
      { label: "destinations", value: "8" },
      { label: "time-to-live", value: "47m" },
    ],
  },
  "platform-preview": {
    primaryLabel: "preview surfaces",
    primaryItems: ["web VDP", "marketplace card", "social feed", "ad creative slot"],
    secondaryLabel: "quality gates",
    secondaryItems: ["text truncation", "asset ratio checks", "CTA visibility"],
    metrics: [
      { label: "preview variants", value: "12+" },
      { label: "post-live fixes", value: "-40%" },
    ],
  },
  impact: {
    primaryLabel: "business KPIs",
    primaryItems: ["days-to-live", "holding cost leakage", "VDP engagement", "cross-channel reach"],
    secondaryLabel: "reporting view",
    secondaryItems: ["by lot", "by team", "by campaign window"],
    metrics: [
      { label: "holding cost saved", value: "$184/unit" },
      { label: "time saved", value: "4d -> 47m" },
    ],
  },
}

const FAQ_BY_STAGE: Record<ActiveStage, FaqItem[]> = {
  intake: [
    {
      id: "q-a-intake",
      question: "Question A: How fast can my team start using this?",
      shortAnswer: "You can start same day because intake + upload checks are guided and do not require process redesign.",
      talkTrack: [
        "We start with your current capture workflow and add AI checks on top.",
        "The first win is faster media readiness without adding headcount.",
        "Your team gets immediate feedback on bad inputs before they slow go-live.",
      ],
      proofPoints: ["VIN and media gaps are detected upfront.", "Operators get clear issue flags in the first stage."],
      relatedFeatureId: "data-prep",
    },
    {
      id: "q-intake-2",
      question: "Will this force my photographers to change everything?",
      shortAnswer: "No, it improves your existing process with guided corrections and quality guardrails.",
      talkTrack: ["Current capture habits still work.", "The system highlights what to fix, so quality improves over time."],
      proofPoints: ["Shooting Guide is available during the processing journey."],
      relatedFeatureId: "upload",
    },
    {
      id: "q-intake-3",
      question: "What slows us down most at intake right now?",
      shortAnswer: "Most delays come from missing VIN/media details, and those are flagged immediately before handoff.",
      talkTrack: [
        "The intake layer prevents bad records from moving downstream.",
        "Your team resolves issues earlier instead of discovering them near publish time.",
      ],
      proofPoints: ["VIN and metadata normalization checks run before processing starts."],
      relatedFeatureId: "data-prep",
    },
  ],
  processing: [
    {
      id: "q-a-processing",
      question: "Question A: How accurate are the AI fixes and matching?",
      shortAnswer: "Smart Match and enhancements are confidence-led, and quality is visible before publish.",
      talkTrack: [
        "Matching confidence and issue resolution are surfaced during processing.",
        "You can inspect each transformation step before moving forward.",
      ],
      proofPoints: ["Smart Match confidence is shown in the flow.", "Transform list demonstrates every applied correction."],
      relatedFeatureId: "smart-match",
    },
    {
      id: "q-processing-2",
      question: "What if original images are inconsistent?",
      shortAnswer: "The stack normalizes backgrounds, exposure, framing, and branding to create consistency.",
      talkTrack: ["AI Enhancement handles visual normalization.", "Background tooling keeps listing look uniform across inventory."],
      proofPoints: ["Backgrounds and AI Enhancements are part of default flow."],
      relatedFeatureId: "ai-enhancements",
    },
    {
      id: "q-processing-3",
      question: "How much manual QA is still needed after AI processing?",
      shortAnswer: "Only exception review typically remains because confidence and applied fixes are visible in-line.",
      talkTrack: ["The system surfaces confidence and what changed on every asset.", "Teams focus on edge cases instead of full manual checks."],
      proofPoints: ["Transform history and match confidence are shown before reveal."],
      relatedFeatureId: "smart-match",
    },
  ],
  reveal: [
    {
      id: "q-a-reveal",
      question: "Question A: What does the buyer experience improve to?",
      shortAnswer: "Listings become richer with 360, video, and cleaner media, which increases confidence and engagement.",
      talkTrack: [
        "At reveal, we move from raw assets to retail-ready content.",
        "This is where quality and presentation begin to influence conversion.",
      ],
      proofPoints: ["360 and media generation are completed before publish.", "Before/after view frames the delta clearly."],
      relatedFeatureId: "360-video",
    },
    {
      id: "q-reveal-2",
      question: "Can marketing reuse these assets immediately?",
      shortAnswer: "Yes. Media Kit packages the outputs so your team can publish and promote immediately.",
      talkTrack: ["No manual export chaos.", "Assets are already standardized for downstream use."],
      proofPoints: ["Media Kit and App Comparison are included in reveal stage coverage."],
      relatedFeatureId: "media-kit",
    },
    {
      id: "q-reveal-3",
      question: "Why do listings still feel flat even with enough photos?",
      shortAnswer: "Richer formats like 360 and video add depth that static galleries alone usually miss.",
      talkTrack: [
        "Reveal turns assets into buyer-facing storytelling, not just documentation.",
        "Interactive and motion formats increase confidence before inquiry.",
      ],
      proofPoints: ["360 spin and short video outputs are generated in the reveal stage."],
      relatedFeatureId: "360-video",
    },
  ],
  live: [
    {
      id: "q-a-live",
      question: "Question A: How quickly can we publish everywhere?",
      shortAnswer: "Once approved, publishing is centralized and pushes to multiple destinations in one flow.",
      talkTrack: [
        "The live stage is built for distribution speed, not just content creation.",
        "Teams can preview and validate before buyers see it.",
      ],
      proofPoints: ["Multiple marketplaces activate from one publishing flow.", "Platform Preview and SmartView reduce post-live fixes."],
      relatedFeatureId: "publishing",
    },
    {
      id: "q-live-2",
      question: "How do I know listings look right on each platform?",
      shortAnswer: "Platform Preview + SmartView let teams verify presentation before and after launch.",
      talkTrack: ["You can catch formatting issues early.", "This lowers rework after listings go live."],
      proofPoints: ["Platform-specific checks are visible in the live stage."],
      relatedFeatureId: "platform-preview",
    },
    {
      id: "q-live-3",
      question: "What usually blocks same-day go-live across channels?",
      shortAnswer: "Manual channel formatting and rework are common blockers, and centralized publishing removes most of that.",
      talkTrack: [
        "A single publish flow handles channel mapping and output packaging.",
        "Preview and validation reduce bounce-backs from destination requirements.",
      ],
      proofPoints: ["Publishing controls include one-click push and channel-specific mapping."],
      relatedFeatureId: "publishing",
    },
  ],
  impact: [
    {
      id: "q-a-impact",
      question: "Question A: What business outcome should I expect?",
      shortAnswer: "The flow is designed to reduce days-to-live, avoid holding cost loss, and improve listing performance.",
      talkTrack: [
        "Impact ties operational speed to measurable financial outcomes.",
        "You can explain ROI in terms of time saved and cost avoided.",
      ],
      proofPoints: ["Go-live time, cost avoided, and reach improvements are summarized together."],
      relatedFeatureId: "impact",
    },
    {
      id: "q-impact-2",
      question: "How should we justify rollout internally?",
      shortAnswer: "Use the impact metrics as your baseline and show staged wins by team.",
      talkTrack: ["Start with one lot/process.", "Scale after proving speed and conversion lift."],
      proofPoints: ["Impact dashboard consolidates the evidence for leadership."],
      relatedFeatureId: "scores",
    },
    {
      id: "q-impact-3",
      question: "Which metric should we watch first after launch?",
      shortAnswer: "Start with days-to-live, then pair it with holding-cost and engagement lift to show full impact.",
      talkTrack: [
        "Speed is usually the earliest leading indicator of value.",
        "Then connect speed gains to cost recovery and buyer interaction metrics.",
      ],
      proofPoints: ["Impact view tracks time, cost, and listing performance in one place."],
      relatedFeatureId: "impact",
    },
  ],
}

const TRANSFORMATIONS = [
  "background removed",
  "studio background applied",
  "shadow added",
  "number plate masked",
  "exposure corrected",
  "tilt corrected",
  "branding injected",
  "360° generated from 8 images",
]

const DESTINATIONS = [
  { name: "dealer website", emoji: "🌐", left: 230, top: 20 },
  { name: "autotrader", emoji: "🚗", left: 430, top: 90 },
  { name: "facebook marketplace", emoji: "📘", left: 450, top: 220 },
  { name: "google ads", emoji: "📊", left: 300, top: 320 },
  { name: "instagram", emoji: "📸", left: 110, top: 260 },
  { name: "cars.com", emoji: "🏷️", left: 70, top: 110 },
]

const CAMPAIGN_FLOW_STEPS = [
  "select campaign template",
  "apply branding + offer copy",
  "generate per-channel creatives",
  "publish campaign with inventory links",
]

const DEFAULT_NEXT_STAGE: Partial<Record<ActiveStage, ActiveStage>> = {
  intake: "processing",
  processing: "reveal",
  reveal: "live",
  live: "impact",
}

const ENTRY_FLOWS: Record<EntryFlowId, EntryFlow> = {
  "slow-live": {
    startStage: "intake",
    stageDefaults: {
      intake: { faqId: "q-a-intake", featureId: "data-prep" },
      processing: { faqId: "q-a-processing", featureId: "smart-match" },
      reveal: { faqId: "q-a-reveal", featureId: "360-video" },
      live: { faqId: "q-a-live", featureId: "publishing" },
      impact: { faqId: "q-a-impact", featureId: "impact" },
    },
  },
  "low-conversion": {
    startStage: "reveal",
    stageDefaults: {
      intake: { faqId: "q-intake-2", featureId: "upload" },
      processing: { faqId: "q-processing-2", featureId: "ai-enhancements" },
      reveal: { faqId: "q-a-reveal", featureId: "360-video" },
      live: { faqId: "q-live-2", featureId: "platform-preview" },
      impact: { faqId: "q-impact-3", featureId: "impact" },
    },
    nextStage: { reveal: "live", live: "impact" },
  },
  "see-everything": {
    startStage: "intake",
    stageDefaults: {
      intake: { faqId: "q-intake-3", featureId: "data-prep" },
      processing: { faqId: "q-processing-3", featureId: "smart-match" },
      reveal: { faqId: "q-reveal-2", featureId: "media-kit" },
      live: { faqId: "q-live-2", featureId: "platform-preview" },
      impact: { faqId: "q-impact-2", featureId: "scores" },
    },
  },
  "manual-edits": {
    startStage: "processing",
    stageDefaults: {
      intake: { faqId: "q-intake-3", featureId: "upload" },
      processing: { faqId: "q-processing-3", featureId: "smart-match" },
      reveal: { faqId: "q-reveal-2", featureId: "media-kit" },
      live: { faqId: "q-live-3", featureId: "publishing" },
      impact: { faqId: "q-impact-2", featureId: "scores" },
    },
    nextStage: { processing: "reveal", reveal: "live", live: "impact" },
  },
  "quality-drift": {
    startStage: "processing",
    stageDefaults: {
      intake: { faqId: "q-intake-2", featureId: "upload" },
      processing: { faqId: "q-processing-2", featureId: "ai-enhancements" },
      reveal: { faqId: "q-reveal-3", featureId: "360-video" },
      live: { faqId: "q-live-2", featureId: "platform-preview" },
      impact: { faqId: "q-impact-2", featureId: "scores" },
    },
    nextStage: { processing: "reveal", reveal: "live", live: "impact" },
  },
  "miss-launch-windows": {
    startStage: "live",
    stageDefaults: {
      intake: { faqId: "q-a-intake", featureId: "data-prep" },
      processing: { faqId: "q-a-processing", featureId: "smart-match" },
      reveal: { faqId: "q-reveal-2", featureId: "media-kit" },
      live: { faqId: "q-live-3", featureId: "publishing" },
      impact: { faqId: "q-a-impact", featureId: "impact" },
    },
    nextStage: { live: "impact" },
  },
  "post-publish-rework": {
    startStage: "live",
    stageDefaults: {
      intake: { faqId: "q-intake-3", featureId: "data-prep" },
      processing: { faqId: "q-processing-3", featureId: "smart-match" },
      reveal: { faqId: "q-reveal-2", featureId: "media-kit" },
      live: { faqId: "q-live-2", featureId: "platform-preview" },
      impact: { faqId: "q-impact-2", featureId: "scores" },
    },
    nextStage: { live: "impact" },
  },
  "data-trust": {
    startStage: "intake",
    stageDefaults: {
      intake: { faqId: "q-intake-3", featureId: "data-prep" },
      processing: { faqId: "q-a-processing", featureId: "smart-match" },
      reveal: { faqId: "q-reveal-2", featureId: "media-kit" },
      live: { faqId: "q-live-2", featureId: "platform-preview" },
      impact: { faqId: "q-impact-2", featureId: "scores" },
    },
  },
  "prove-roi": {
    startStage: "impact",
    stageDefaults: {
      intake: { faqId: "q-a-intake", featureId: "data-prep" },
      processing: { faqId: "q-processing-3", featureId: "smart-match" },
      reveal: { faqId: "q-a-reveal", featureId: "360-video" },
      live: { faqId: "q-a-live", featureId: "publishing" },
      impact: { faqId: "q-a-impact", featureId: "impact" },
    },
  },
}

const ENTRY_OPTIONS: EntryOption[] = [
  { id: "slow-live", label: "getting cars live too slowly", persona: "ops" },
  { id: "low-conversion", label: "listings don't convert", persona: "marketing" },
  { id: "see-everything", label: "i want to see everything", persona: "exec" },
  { id: "manual-edits", label: "manual edits eat our day", persona: "ops" },
  { id: "quality-drift", label: "photo quality is all over the place", persona: "ops" },
  { id: "miss-launch-windows", label: "we miss launch windows", persona: "marketing" },
  { id: "post-publish-rework", label: "too much rework after publish", persona: "marketing" },
  { id: "data-trust", label: "i can't trust the data yet", persona: "exec" },
  { id: "prove-roi", label: "hard to prove ROI quickly", persona: "exec" },
]

const FONT_STACK = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const RAW_IMAGE_SET = [
  "/demo-console/raw/raw-01.png",
  "/demo-console/raw/raw-02.png",
  "/demo-console/raw/raw-03.png",
  "/demo-console/raw/raw-04.png",
  "/demo-console/raw/raw-05.png",
  "/demo-console/raw/raw-06.png",
  "/demo-console/raw/raw-07.png",
  "/demo-console/raw/raw-08.png",
  "/demo-console/raw/raw-09.png",
  "/demo-console/raw/raw-10.png",
  "/demo-console/raw/raw-11.png",
]

const PROCESSED_IMAGE_SET = [
  "/demo-console/processed/processed-01.png",
  "/demo-console/processed/processed-02.png",
  "/demo-console/processed/processed-03.png",
  "/demo-console/processed/processed-04.png",
  "/demo-console/processed/processed-05.png",
  "/demo-console/processed/processed-06.png",
  "/demo-console/processed/processed-07.png",
  "/demo-console/processed/processed-08.png",
]

const STATIC_VEHICLE_TITLE = "2018 mercedes-benz gle 350"
const STATIC_VEHICLE_VIN_MASKED = "4JGD···A12345"

const IMPORT_TASKS = ["importing VIN data", "syncing dealer profile", "mapping listing channels", "building baseline metrics"] as const

const USED_CAR_BOOK_NOTES = [
  "aged inventory pressure usually spikes after 45+ days",
  "photo quality/completeness strongly correlates with vdp depth",
  "faster publish velocity protects margin on used units",
] as const

const buildMockImportContext = (websiteUrl: string) => {
  const normalized = websiteUrl.trim().toLowerCase()
  const withoutProtocol = normalized.replace(/^https?:\/\//, "")
  const hostname = withoutProtocol.split("/")[0] || "dealer.example"
  const cleanDomain = hostname.replace(/^www\./, "")
  const dealerBase = cleanDomain.split(".")[0]?.replace(/[^a-z0-9]/g, " ") || "dealer"
  const dealerName = dealerBase
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
  const seed = cleanDomain.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const holdingCostPerDay = 38 + (seed % 19)
  const agedInventoryRate = 21 + (seed % 15)
  const photoComplianceRate = 64 + (seed % 18)
  const vdpToLeadRate = Number((1.4 + (seed % 9) * 0.14).toFixed(2))
  const daysToLive = 3 + (seed % 4)
  const usedCarBookSegment = ["value lot mix", "mid-market family mix", "premium suv mix"][seed % 3]
  return {
    dealerName: dealerName || "Demo Dealer Group",
    inventoryCount: 120 + (seed % 180),
    holdingCostPerDay,
    channelsCount: 6 + (seed % 4),
    agedInventoryRate,
    photoComplianceRate,
    vdpToLeadRate,
    daysToLive,
    usedCarBookSegment,
  }
}

export default function V3CinematicDemo() {
  const [stage, setStage] = useState<Stage>("website")
  const [, setPersona] = useState<Persona | null>(null)
  const [holdingCost, setHoldingCost] = useState(0)
  const [costStopped, setCostStopped] = useState(false)
  const [entryPhase, setEntryPhase] = useState<"choices" | "leaving">("choices")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [websiteInputError, setWebsiteInputError] = useState("")
  const [websiteImportState, setWebsiteImportState] = useState<"idle" | "importing" | "ready">("idle")
  const [websiteImportProgress, setWebsiteImportProgress] = useState(0)
  const [mockDealerName, setMockDealerName] = useState("Demo Dealer Group")
  const [mockInventoryCount, setMockInventoryCount] = useState(164)
  const [mockHoldingCostPerDay, setMockHoldingCostPerDay] = useState(46)
  const [mockChannelsCount, setMockChannelsCount] = useState(8)
  const [mockAgedInventoryRate, setMockAgedInventoryRate] = useState(29)
  const [mockPhotoComplianceRate, setMockPhotoComplianceRate] = useState(71)
  const [mockVdpToLeadRate, setMockVdpToLeadRate] = useState(2.06)
  const [mockDaysToLive, setMockDaysToLive] = useState(4)
  const [mockUsedCarBookSegment, setMockUsedCarBookSegment] = useState("mid-market family mix")
  const [transformCount, setTransformCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [activeDests, setActiveDests] = useState(0)
  const [emailSent, setEmailSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeFlowId, setActiveFlowId] = useState<EntryFlowId | null>(null)
  const [featureModalId, setFeatureModalId] = useState<string | null>(null)
  const [vehicleCompareOpen, setVehicleCompareOpen] = useState(false)
  const [vehicleCompareIndex, setVehicleCompareIndex] = useState(0)
  const [faqOpen, setFaqOpen] = useState(false)
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null)

  const isPreJourney = stage === "website" || stage === "entry"
  const activeStage = isPreJourney ? null : (stage as ActiveStage)
  const showCar = stage === "intake" || stage === "processing" || stage === "reveal" || stage === "live"
  const isProcessed = stage === "reveal" || stage === "live"
  const isCompact = stage === "live"
  const currentIdx = activeStage ? STAGES_ORDER.indexOf(activeStage) : -1
  const stageIndex = activeStage ? STAGES_ORDER.indexOf(activeStage) : -1
  const fourDayLoss = mockHoldingCostPerDay * 4
  const hourlyCost = mockHoldingCostPerDay / 24
  const improvedAgedInventoryRate = Math.max(mockAgedInventoryRate - 8, 10)
  const improvedPhotoComplianceRate = Math.min(mockPhotoComplianceRate + 18, 97)
  const improvedVdpToLeadRate = Number((mockVdpToLeadRate * 1.28).toFixed(2))
  const qualityMediaScore = Math.min(99, improvedPhotoComplianceRate)
  const qualityWebsiteScore = Math.min(99, Math.round(78 + improvedVdpToLeadRate * 6))
  const qualityOverallScore = Math.round((qualityMediaScore + qualityWebsiteScore) / 2)
  const campaignFlowProgress = Math.min(
    CAMPAIGN_FLOW_STEPS.length,
    Math.ceil((activeDests / DESTINATIONS.length) * CAMPAIGN_FLOW_STEPS.length)
  )
  const coveredFeatures = FULL_FEATURES.filter((feature) => {
    const featureIdx = STAGES_ORDER.indexOf(feature.stage)
    return !isPreJourney && featureIdx <= stageIndex
  })
  const modalFeature = FULL_FEATURES.find((feature) => feature.id === featureModalId) ?? null
  const modalCoverage = modalFeature ? FEATURE_COVERAGE_ELEMENTS[modalFeature.id] : null
  const faqStage: ActiveStage = isPreJourney ? "intake" : stage
  const currentFaqs = FAQ_BY_STAGE[faqStage]
  const activeFaq = currentFaqs.find((item) => item.id === activeFaqId) ?? currentFaqs[0]
  const displayTitle = STATIC_VEHICLE_TITLE
  const displayVin = STATIC_VEHICLE_VIN_MASKED
  const imageSet = isProcessed ? PROCESSED_IMAGE_SET : RAW_IMAGE_SET
  const tileImages = imageSet.slice(0, 6)
  // Keep angle thumbnails and preview panes in sync.
  // When a true one-to-one raw angle set is unavailable, fall back to the same
  // processed image so we never show mismatched angles.
  const vehicleComparePairs = PROCESSED_IMAGE_SET.map((processedSrc) => ({
    before: processedSrc,
    after: processedSrc,
  }))
  const safeVehicleCompareIndex = Math.min(
    vehicleComparePairs.length - 1,
    Math.max(0, vehicleCompareIndex)
  )
  const activeVehicleComparePair = vehicleComparePairs[safeVehicleCompareIndex]

  const resolveFlowStageDefaults = (targetStage: ActiveStage, flowId: EntryFlowId | null = activeFlowId) => {
    if (!flowId) return null
    return ENTRY_FLOWS[flowId]?.stageDefaults[targetStage] ?? null
  }

  const transitionToStage = (targetStage: ActiveStage, flowId: EntryFlowId | null = activeFlowId) => {
    const defaults = resolveFlowStageDefaults(targetStage, flowId)
    setStage(targetStage)
    setActiveFaqId(defaults?.faqId ?? FAQ_BY_STAGE[targetStage][0]?.id ?? null)
  }

  const advanceFromStage = (fromStage: ActiveStage) => {
    const flow = activeFlowId ? ENTRY_FLOWS[activeFlowId] : null
    const nextStage = flow?.nextStage?.[fromStage] ?? DEFAULT_NEXT_STAGE[fromStage]
    if (!nextStage) return
    transitionToStage(nextStage)
  }

  // ── holding cost ticker ──
  useEffect(() => {
    if (isPreJourney || costStopped) return
    const id = setInterval(() => setHoldingCost((h) => h + 0.05), 1000)
    return () => clearInterval(id)
  }, [stage, costStopped, isPreJourney])

  // ── stop cost at reveal ──
  useEffect(() => {
    if (stage === "reveal" || stage === "live" || stage === "impact") {
      setCostStopped(true)
    }
  }, [stage])

  // ── processing auto-advance ──
  useEffect(() => {
    if (stage !== "processing") return
    setTransformCount(0)
    setProgress(0)

    const progressId = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / 60, 100))
    }, 100)

    const tTimers = TRANSFORMATIONS.map((_, i) =>
      setTimeout(() => setTransformCount(i + 1), (i + 1) * 700)
    )

    const advanceTimer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => advanceFromStage("processing"), 400)
    }, 6000)

    return () => {
      clearInterval(progressId)
      tTimers.forEach(clearTimeout)
      clearTimeout(advanceTimer)
    }
  }, [stage, activeFlowId])

  // ── live destinations auto-activate ──
  useEffect(() => {
    if (stage !== "live") return
    setActiveDests(0)
    const timers = DESTINATIONS.map((_, i) =>
      setTimeout(() => setActiveDests(i + 1), 600 + i * 500)
    )
    return () => timers.forEach(clearTimeout)
  }, [stage])

  useEffect(() => {
    if (isPreJourney) {
      setFaqOpen(false)
      setActiveFaqId(null)
      setFeatureModalId(null)
      return
    }
    const flowDefaults = resolveFlowStageDefaults(stage)
    setActiveFaqId(flowDefaults?.faqId ?? FAQ_BY_STAGE[stage][0]?.id ?? null)
  }, [stage, activeFlowId, isPreJourney])

  useEffect(() => {
    if (stage !== "website" || websiteImportState !== "importing") return
    setWebsiteImportProgress(0)
    let nextProgress = 0
    const timerId = setInterval(() => {
      nextProgress += 5
      setWebsiteImportProgress(Math.min(nextProgress, 100))
      if (nextProgress >= 100) {
        clearInterval(timerId)
        setWebsiteImportState("ready")
        setTimeout(() => {
          setStage("entry")
          setEntryPhase("choices")
        }, 500)
      }
    }, 110)
    return () => clearInterval(timerId)
  }, [stage, websiteImportState])

  const pickEntryOption = (option: EntryOption) => {
    setPersona(option.persona)
    setActiveFlowId(option.id)
    setFaqOpen(false)
    setFeatureModalId(null)
    setEntryPhase("leaving")
    setTimeout(() => transitionToStage(ENTRY_FLOWS[option.id].startStage, option.id), 1200)
  }

  const startWebsiteImport = () => {
    const trimmed = websiteUrl.trim()
    if (!trimmed) {
      setWebsiteInputError("enter website url to continue")
      return
    }
    const normalizedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    try {
      new URL(normalizedUrl)
    } catch {
      setWebsiteInputError("enter valid website url")
      return
    }
    setWebsiteInputError("")
    const mockContext = buildMockImportContext(normalizedUrl)
    setMockDealerName(mockContext.dealerName)
    setMockInventoryCount(mockContext.inventoryCount)
    setMockHoldingCostPerDay(mockContext.holdingCostPerDay)
    setMockChannelsCount(mockContext.channelsCount)
    setMockAgedInventoryRate(mockContext.agedInventoryRate)
    setMockPhotoComplianceRate(mockContext.photoComplianceRate)
    setMockVdpToLeadRate(mockContext.vdpToLeadRate)
    setMockDaysToLive(mockContext.daysToLive)
    setMockUsedCarBookSegment(mockContext.usedCarBookSegment)
    setWebsiteImportState("importing")
  }

  const goTo = (idx: number) => {
    if (idx === currentIdx) return
    const target = STAGES_ORDER[idx]
    transitionToStage(target)
    if (idx < 2) setCostStopped(false)
    if (idx >= 2) setCostStopped(true)
  }

  const openFeatureModal = (featureId?: string) => {
    if (!featureId) return
    const feature = FULL_FEATURES.find((item) => item.id === featureId)
    if (!feature) return
    setFeatureModalId(feature.id)
  }

  const openVehicleCompareModal = (index = 0) => {
    setVehicleCompareIndex(index)
    setVehicleCompareOpen(true)
  }

  const jumpToFeature = (featureId?: string) => {
    if (!featureId) return
    const feature = FULL_FEATURES.find((item) => item.id === featureId)
    if (!feature) return
    transitionToStage(feature.stage, null)
    setFeatureModalId(feature.id)
  }

  const cycleModalFeature = (direction: "prev" | "next") => {
    if (!modalFeature) return
    const currentIndex = FULL_FEATURES.findIndex((feature) => feature.id === modalFeature.id)
    if (currentIndex === -1) return
    const step = direction === "next" ? 1 : -1
    const nextIndex = (currentIndex + step + FULL_FEATURES.length) % FULL_FEATURES.length
    setFeatureModalId(FULL_FEATURES[nextIndex]?.id ?? modalFeature.id)
  }

  const openCurrentStageExplainer = () => {
    if (isPreJourney) return
    const flowDefaults = resolveFlowStageDefaults(stage)
    if (flowDefaults?.featureId) {
      setFeatureModalId(flowDefaults.featureId)
      return
    }
    const firstStageFeature = FULL_FEATURES.find((feature) => feature.stage === stage)
    if (!firstStageFeature) return
    setFeatureModalId(firstStageFeature.id)
  }

  const stageFeatures = isPreJourney ? [] : FULL_FEATURES.filter((feature) => feature.stage === stage)

  const carStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "fixed",
      zIndex: 20,
      transition:
        "left 0.7s cubic-bezier(0.16,1,0.3,1), top 0.7s cubic-bezier(0.16,1,0.3,1), width 0.7s cubic-bezier(0.16,1,0.3,1), height 0.7s cubic-bezier(0.16,1,0.3,1)",
    }
    switch (stage) {
      case "intake":
        return { ...base, left: "calc(30% - 160px)", top: "calc(50% - 140px)", width: 320, height: 200 }
      case "processing":
        return { ...base, left: "calc(50% - 190px)", top: "calc(50% - 180px)", width: 380, height: 240 }
      case "reveal":
        return { ...base, left: "calc(50% - 190px)", top: 90, width: 380, height: 240 }
      case "live":
        return { ...base, left: 24, top: 60, width: 180, height: 110 }
      default:
        return base
    }
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#0A0914", fontFamily: FONT_STACK, color: "#fff" }}
    >
      {/* ═══════════════════ TOP BAR ═══════════════════ */}
      <AnimatePresence>
        {!isPreJourney && (
          <motion.div
            key="topbar"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6"
            style={{ height: 44, background: "#0A0914", borderBottom: "1px solid #1E1B2E" }}
          >
            <Link
              href="/"
              style={{ fontSize: 13, letterSpacing: "0.15em", textDecoration: "none", color: "inherit" }}
            >
              spyne
            </Link>

            <div className="flex items-center gap-3">
              {STAGES_ORDER.map((s, i) => (
                <button
                  key={s}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === currentIdx ? 8 : 5,
                    height: i === currentIdx ? 8 : 5,
                    borderRadius: "50%",
                    background: i === currentIdx ? "#6C47FF" : i < currentIdx ? "#9B97B5" : "#2A2640",
                    border: "none",
                    padding: 0,
                    cursor: i !== currentIdx ? "pointer" : "default",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </div>

            <button
              onClick={openCurrentStageExplainer}
              className="cursor-pointer"
              style={{
                height: 24,
                background: "transparent",
                border: "1px solid #2A2640",
                borderRadius: 999,
                padding: "0 10px",
                color: "#9B97B5",
                fontSize: 11,
              }}
            >
              explain this stage
            </button>

            <div className="flex items-center gap-2">
              <motion.span
                animate={!costStopped ? { opacity: [1, 0.5, 1] } : {}}
                transition={!costStopped ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
                style={{ fontSize: 13, fontWeight: 500, color: "#EF9F27" }}
              >
                ${holdingCost.toFixed(2)}
              </motion.span>
              <span style={{ fontSize: 11, color: "#5F5A7A" }}>/ day avg</span>
              {costStopped && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ fontSize: 11, color: "#22C55E", marginLeft: 4 }}
                >
                  stopped ✓
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════ CAR UNIT ═══════════════════ */}
      {showCar && (
        <div style={carStyle()}>
          <div
            className="w-full h-full relative overflow-hidden"
            onClick={() => openVehicleCompareModal(0)}
            style={{
              background: "#1E1B2E",
              border: `1px solid ${isProcessed ? "#6C47FF" : "#2A2640"}`,
              transition: "border-color 0.6s ease",
              cursor: "zoom-in",
            }}
          >
            <div
              className="absolute top-2 left-2"
              style={{ fontSize: isCompact ? 9 : 13 }}
            >
              {displayTitle}
            </div>

            {!isCompact && (
              <div
                className="absolute bottom-2 left-2"
                style={{ fontSize: 10, color: "#9B97B5" }}
              >
                {displayVin}
              </div>
            )}

            <div
              className={`absolute inset-0 grid grid-cols-3 grid-rows-2 ${
                isCompact ? "gap-0.5 p-3 pt-5" : "gap-1.5 p-8 pt-10"
              }`}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation()
                    openVehicleCompareModal(i)
                  }}
                  style={{
                    background: isProcessed ? "#1A1535" : "#2A2640",
                    border: isProcessed ? "0.5px solid #6C47FF" : "0.5px solid transparent",
                    transition: "all 0.6s ease",
                    transitionDelay: `${i * 50}ms`,
                    position: "relative",
                    overflow: "hidden",
                    cursor: "zoom-in",
                  }}
                >
                  {tileImages[i] && (
                    <img
                      src={tileImages[i]}
                      alt={STATIC_VEHICLE_TITLE}
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{
                        opacity: isProcessed ? 1 : 0.62,
                        filter: isProcessed ? "none" : "grayscale(20%)",
                        transition: "all 0.6s ease",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div
              className="absolute bottom-2 right-2 flex items-center gap-1"
              style={{ fontSize: isCompact ? 7 : 11 }}
            >
              <div
                className="rounded-full"
                style={{
                  width: isCompact ? 4 : 6,
                  height: isCompact ? 4 : 6,
                  background: isProcessed ? "#22C55E" : "#E24B4A",
                  transition: "background 0.6s ease",
                }}
              />
              <span
                style={{
                  color: isProcessed ? "#22C55E" : "#E24B4A",
                  transition: "color 0.6s ease",
                }}
              >
                {isProcessed ? "ready" : "not live"}
              </span>
            </div>
            {!isCompact && (
              <div
                className="absolute top-2 right-2"
                style={{
                  fontSize: 9,
                  color: "#B8B4CC",
                  border: "1px solid #2A2640",
                  background: "rgba(10, 9, 20, 0.78)",
                  borderRadius: 999,
                  padding: "2px 7px",
                }}
              >
                click to compare
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ STAGE CONTENT ═══════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* ──────── ENTRY ──────── */}
          {stage === "website" && (
            <div className="min-h-screen flex flex-col items-center justify-center relative px-6">
              <Link
                href="/"
                className="absolute"
                style={{ top: 40, fontSize: 18, letterSpacing: "0.15em", textDecoration: "none", color: "inherit" }}
              >
                spyne
              </Link>

              <div className="w-full max-w-2xl" style={{ border: "1px solid #2A2640", borderRadius: 12, background: "#121024", padding: 24 }}>
                <p style={{ fontSize: 11, color: "#6C47FF", letterSpacing: "0.08em", marginBottom: 8 }}>V3 PREP (DUMMY UI)</p>
                <h1 style={{ fontSize: 30, fontWeight: 450, marginBottom: 10 }}>enter customer website url</h1>
                <p style={{ fontSize: 13, color: "#9B97B5", marginBottom: 18 }}>
                  we&apos;ll simulate importing VIN data, dealer profile, and channel mappings before starting the flow.
                </p>
                <div
                  className="mb-4"
                  style={{ border: "1px solid #2A2640", borderRadius: 8, background: "#17142A", padding: 10 }}
                >
                  <p style={{ fontSize: 11, color: "#6C47FF", marginBottom: 6 }}>
                    did you know?
                  </p>
                  {USED_CAR_BOOK_NOTES.map((note) => (
                    <p key={note} style={{ fontSize: 11, color: "#9B97B5", lineHeight: 1.45, marginBottom: 4 }}>
                      • {note}
                    </p>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => {
                      setWebsiteUrl(e.target.value)
                      setWebsiteInputError("")
                    }}
                    placeholder="https://dealer-site.com"
                    disabled={websiteImportState !== "idle"}
                    className="outline-none flex-1"
                    style={{
                      height: 40,
                      background: "#1E1B2E",
                      border: "1px solid #2A2640",
                      color: "#fff",
                      borderRadius: 6,
                      padding: "0 12px",
                      fontSize: 13,
                    }}
                  />
                  <button
                    onClick={startWebsiteImport}
                    disabled={websiteImportState !== "idle"}
                    className="cursor-pointer"
                    style={{
                      height: 40,
                      background: websiteImportState === "idle" ? "#6C47FF" : "#3D3855",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "0 14px",
                      fontSize: 13,
                    }}
                  >
                    analyze website
                  </button>
                </div>
                {websiteInputError && <p style={{ marginTop: 8, fontSize: 12, color: "#E24B4A" }}>{websiteInputError}</p>}

                {websiteImportState !== "idle" && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ height: 4, background: "#1E1B2E", borderRadius: 999 }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${websiteImportProgress}%`,
                          background: "#6C47FF",
                          borderRadius: 999,
                          transition: "width 0.11s linear",
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {IMPORT_TASKS.map((task, idx) => {
                        const taskThreshold = ((idx + 1) / IMPORT_TASKS.length) * 100
                        const completed = websiteImportProgress >= taskThreshold
                        return (
                          <span
                            key={task}
                            style={{
                              fontSize: 11,
                              borderRadius: 999,
                              padding: "4px 10px",
                              border: `1px solid ${completed ? "#6C47FF" : "#2A2640"}`,
                              background: completed ? "#1A1535" : "transparent",
                              color: completed ? "#DDD7FF" : "#6F6A8A",
                            }}
                          >
                            {completed ? "✓ " : ""}{task}
                          </span>
                        )
                      })}
                    </div>
                    <p style={{ marginTop: 10, fontSize: 12, color: "#9B97B5" }}>
                      dealer: {mockDealerName} • inventory: {mockInventoryCount} units • baseline: ${mockHoldingCostPerDay}/day
                    </p>
                  </div>
                )}
                <p style={{ marginTop: 14, marginBottom: 8, fontSize: 11, color: "#6C47FF" }}>
                  {websiteImportState === "idle"
                    ? "analysis preview"
                    : `real analysis from ${mockDealerName.toLowerCase()} website`}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { label: "used-car segment", value: mockUsedCarBookSegment },
                    { label: "days-to-live baseline", value: `${mockDaysToLive} days` },
                    { label: "aged units (45+ days)", value: `${mockAgedInventoryRate}%` },
                    { label: "photo compliance", value: `${mockPhotoComplianceRate}%` },
                    { label: "vdp to lead rate", value: `${mockVdpToLeadRate}%` },
                    { label: "live channels mapped", value: `${mockChannelsCount}` },
                  ].map((card) => (
                    <div
                      key={card.label}
                      style={{
                        border: "1px solid #2A2640",
                        borderRadius: 8,
                        background: "#17142A",
                        padding: "8px 10px",
                      }}
                    >
                      <p style={{ fontSize: 10, color: "#6F6A8A", marginBottom: 3 }}>{card.label}</p>
                      <p style={{ fontSize: 13, color: "#DDD7FF" }}>{card.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {stage === "entry" && (
            <div className="min-h-screen flex flex-col items-center justify-center relative">
              <Link
                href="/"
                className="absolute"
                style={{ top: 40, fontSize: 18, letterSpacing: "0.15em", textDecoration: "none", color: "inherit" }}
              >
                spyne
              </Link>

              <AnimatePresence mode="wait">
                {entryPhase === "choices" ? (
                  <motion.div
                    key="choices"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <h1 style={{ fontSize: 32, fontWeight: 400, marginBottom: 32 }}>
                      what&apos;s slowing you down?
                    </h1>
                    <p style={{ fontSize: 12, color: "#9B97B5", marginBottom: 20 }}>
                      using website analysis from {mockDealerName.toLowerCase()} ({mockInventoryCount} units)
                    </p>
                    <div
                      className="mb-5 w-full"
                      style={{
                        maxWidth: 920,
                        border: "1px solid #2A2640",
                        borderRadius: 8,
                        background: "#121024",
                        padding: "10px 12px",
                      }}
                    >
                      <p style={{ fontSize: 11, color: "#6C47FF", marginBottom: 7 }}>
                        quick dealership analysis (used-car book signals)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          `${mockDaysToLive} days to go live`,
                          `${mockAgedInventoryRate}% aged units`,
                          `${mockPhotoComplianceRate}% photo compliance`,
                          `${mockVdpToLeadRate}% vdp->lead`,
                        ].map((item) => (
                          <span
                            key={item}
                            style={{
                              fontSize: 11,
                              borderRadius: 999,
                              padding: "4px 10px",
                              border: "1px solid #2A2640",
                              color: "#9B97B5",
                            }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center" style={{ maxWidth: 980 }}>
                      {ENTRY_OPTIONS.map((opt, i) => (
                        <motion.button
                          key={`${opt.persona}-${i}`}
                          onClick={() => pickEntryOption(opt)}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          className="cursor-pointer border border-[#2A2640] text-[#9B97B5] hover:border-[#6C47FF] hover:text-white bg-transparent transition-colors duration-150"
                          style={{ padding: "10px 20px", borderRadius: 6, fontSize: 14 }}
                        >
                          {opt.label}
                        </motion.button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setActiveFlowId(null)
                        transitionToStage("intake", null)
                        setFeatureModalId("data-prep")
                      }}
                      className="cursor-pointer bg-transparent border border-[#2A2640] text-[#9B97B5] hover:border-[#6C47FF] hover:text-white transition-colors duration-150 mt-6"
                      style={{ padding: "10px 20px", borderRadius: 6, fontSize: 13 }}
                    >
                      show all features in this v3 flow
                    </button>
                  </motion.div>
                ) : (
                  <motion.p
                    key="leaving"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ fontSize: 16, color: "#9B97B5" }}
                  >
                    let&apos;s fix that.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ──────── INTAKE ──────── */}
          {stage === "intake" && (
            <div className="min-h-screen flex" style={{ paddingTop: 44 }}>
              <div className="w-[60%] flex flex-col items-center justify-center">
                <div style={{ width: 320, height: 200 }} />
                <div
                  className="flex flex-wrap gap-2 mt-5 justify-center"
                  style={{ maxWidth: 340 }}
                >
                  {[
                    "inconsistent backgrounds",
                    "no branding",
                    "plate not masked",
                    "overexposed: 3 images",
                  ].map((problem, i) => (
                    <motion.span
                      key={problem}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.4 }}
                      style={{
                        background: "#1A0A0A",
                        border: "1px solid #E24B4A",
                        color: "#E24B4A",
                        fontSize: 11,
                        borderRadius: 4,
                        padding: "4px 10px",
                      }}
                    >
                      {problem}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="w-[40%] flex flex-col justify-center pr-16">
                <p style={{ fontSize: 13, color: "#9B97B5", marginBottom: 8 }}>
                  this car is costing you
                </p>
                <motion.p
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ fontSize: 48, fontWeight: 500, color: "#EF9F27", marginBottom: 8 }}
                >
                  ${holdingCost.toFixed(2)}
                </motion.p>
                <p style={{ fontSize: 13, color: "#9B97B5", marginBottom: 32 }}>
                  every day it&apos;s not live
                </p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  style={{
                    fontSize: 13,
                    color: "#5F5A7A",
                    maxWidth: 240,
                    lineHeight: 1.6,
                    marginBottom: 32,
                  }}
                >
                  at ${mockHoldingCostPerDay}/day average holding cost, every hour is ${hourlyCost.toFixed(2)} gone.
                </motion.p>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                  onClick={() => {
                    advanceFromStage("intake")
                  }}
                  className="text-left cursor-pointer hover:underline bg-transparent border-none p-0"
                  style={{ fontSize: 14, color: "#6C47FF" }}
                >
                  process with ai →
                </motion.button>
                <button
                  onClick={openCurrentStageExplainer}
                  className="mt-4 text-left cursor-pointer hover:underline bg-transparent border-none p-0"
                  style={{ fontSize: 12, color: "#9B97B5" }}
                >
                  open intake explainer
                </button>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stageFeatures.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => openFeatureModal(feature.id)}
                      className="cursor-pointer bg-transparent border border-[#2A2640] text-[#9B97B5] hover:border-[#6C47FF] hover:text-white transition-colors duration-150"
                      style={{ padding: "4px 9px", borderRadius: 999, fontSize: 11 }}
                    >
                      open {feature.label}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: "#5F5A7A", marginTop: 12 }}>
                  includes data prep + upload checks before processing.
                </p>
              </div>
            </div>
          )}

          {/* ──────── PROCESSING ──────── */}
          {stage === "processing" && (
            <div
              className="min-h-screen flex flex-col items-center justify-center"
              style={{ paddingTop: 44 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ fontSize: 11, color: "#9B97B5", letterSpacing: "0.1em", marginBottom: 12 }}
              >
                processing
              </motion.span>

              <div style={{ width: 380, height: 240 }} />

              <div style={{ width: 380, height: 2, background: "#1E1B2E", marginTop: 16 }}>
                <div
                  style={{
                    height: "100%",
                    background: "#6C47FF",
                    width: `${Math.min(progress, 100)}%`,
                    transition: "width 0.1s linear",
                  }}
                />
              </div>

              <div className="mt-4" style={{ width: 380, minHeight: 80 }}>
                <p style={{ fontSize: 11, color: "#6C47FF", letterSpacing: "0.08em", marginBottom: 8 }}>
                  what we transformed
                </p>
                {TRANSFORMATIONS.slice(
                  Math.max(0, transformCount - 4),
                  transformCount
                ).map((t) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      fontSize: 12,
                      marginBottom: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span style={{ color: "#6C47FF" }}>✓</span>
                    <span style={{ color: "#9B97B5" }}>{t}</span>
                  </motion.div>
                ))}
              </div>

              <div
                className="fixed right-6 flex items-center gap-2"
                style={{ top: 56 }}
              >
                <span style={{ fontSize: 10, color: "#5F5A7A" }}>
                  still costing you money
                </span>
              </div>
              <p style={{ fontSize: 11, color: "#5F5A7A", marginTop: 24 }}>
                smart match, ai fixes, background handling, and shooting guidance running in sequence.
              </p>
              <button
                onClick={openCurrentStageExplainer}
                className="mt-4 cursor-pointer hover:underline bg-transparent border-none p-0"
                style={{ fontSize: 12, color: "#9B97B5" }}
              >
                open processing explainer
              </button>
              <div className="mt-3 flex flex-wrap justify-center gap-2" style={{ maxWidth: 640 }}>
                {stageFeatures.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => openFeatureModal(feature.id)}
                    className="cursor-pointer bg-transparent border border-[#2A2640] text-[#9B97B5] hover:border-[#6C47FF] hover:text-white transition-colors duration-150"
                    style={{ padding: "4px 9px", borderRadius: 999, fontSize: 11 }}
                  >
                    open {feature.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ──────── REVEAL ──────── */}
          {stage === "reveal" && (
            <div
              className="min-h-screen flex flex-col items-center"
              style={{ paddingTop: 372 }}
            >
              <div className="flex w-full max-w-[760px] px-8" style={{ marginTop: 8 }}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex-1 pr-6"
                >
                  <span style={{ fontSize: 10, color: "#5F5A7A", letterSpacing: "0.08em" }}>
                    before
                  </span>
                  <p style={{ fontSize: 20, marginTop: 12 }}>0 marketplaces</p>
                  <p style={{ fontSize: 20, marginTop: 8 }}>0 vdp views</p>
                  <p style={{ fontSize: 20, marginTop: 8, color: "#E24B4A" }}>
                    ${fourDayLoss} lost already
                  </p>
                </motion.div>

                <div style={{ width: 1, background: "#2A2640", alignSelf: "stretch" }} />

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex-1 pl-6"
                >
                  <span style={{ fontSize: 10, color: "#6C47FF", letterSpacing: "0.08em" }}>
                    after spyne
                  </span>
                  <p style={{ fontSize: 20, marginTop: 12 }}>4 marketplaces ready</p>
                  <p style={{ fontSize: 20, marginTop: 8 }}>live in &lt; 15 min</p>
                  <p style={{ fontSize: 20, marginTop: 8, color: "#22C55E" }}>
                    clock stops now
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95 }}
                className="mt-8 w-full max-w-[760px] px-8"
              >
                <div
                  style={{
                    border: "1px solid #2A2640",
                    background: "#121024",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <p style={{ fontSize: 11, color: "#6C47FF", letterSpacing: "0.08em", marginBottom: 10 }}>
                    quality score
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "media", value: qualityMediaScore },
                      { label: "website", value: qualityWebsiteScore },
                      { label: "overall", value: qualityOverallScore },
                    ].map((score) => (
                      <div
                        key={score.label}
                        style={{ border: "1px solid #2A2640", borderRadius: 8, padding: 10, background: "#0F0D1D" }}
                      >
                        <p style={{ fontSize: 10, color: "#9B97B5", marginBottom: 6 }}>{score.label}</p>
                        <p style={{ fontSize: 22, lineHeight: 1, fontWeight: 600 }}>{score.value}</p>
                        <p style={{ fontSize: 10, color: "#22C55E", marginTop: 6 }}>
                          {score.value >= 90 ? "excellent" : score.value >= 80 ? "strong" : "improving"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                onClick={() => {
                  advanceFromStage("reveal")
                }}
                className="mt-10 cursor-pointer hover:underline bg-transparent border-none p-0"
                style={{ fontSize: 14, color: "#6C47FF" }}
              >
                publish it →
              </motion.button>
              <button
                onClick={openCurrentStageExplainer}
                className="mt-4 cursor-pointer hover:underline bg-transparent border-none p-0"
                style={{ fontSize: 12, color: "#9B97B5" }}
              >
                open reveal explainer
              </button>
              <div className="mt-3 flex flex-wrap justify-center gap-2" style={{ maxWidth: 720 }}>
                {stageFeatures.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => openFeatureModal(feature.id)}
                    className="cursor-pointer bg-transparent border border-[#2A2640] text-[#9B97B5] hover:border-[#6C47FF] hover:text-white transition-colors duration-150"
                    style={{ padding: "4px 9px", borderRadius: 999, fontSize: 11 }}
                  >
                    open {feature.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ──────── LIVE ──────── */}
          {stage === "live" && (
            <div
              className="min-h-screen flex flex-col items-center justify-center"
              style={{ paddingTop: 44 }}
            >
              <div className="relative" style={{ width: 620, height: 400 }}>
                {/* hub */}
                <div
                  className="absolute rounded-full flex items-center justify-center"
                  style={{
                    left: 290,
                    top: 180,
                    width: 40,
                    height: 40,
                    background: "#6C47FF",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600 }}>S</span>
                </div>

                {/* lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {DESTINATIONS.map((d, i) => (
                    <line
                      key={`l-${i}`}
                      x1={310}
                      y1={200}
                      x2={d.left + 60}
                      y2={d.top + 22}
                      stroke="#6C47FF"
                      strokeWidth={1}
                      opacity={i < activeDests ? 0.3 : 0}
                      style={{ transition: "opacity 0.4s ease" }}
                    />
                  ))}
                </svg>

                {/* destination nodes */}
                {DESTINATIONS.map((d, i) => (
                  <div
                    key={d.name}
                    className="absolute flex items-center gap-2"
                    style={{
                      left: d.left,
                      top: d.top,
                      width: 130,
                      height: 44,
                      background: "#1E1B2E",
                      border: `1px solid ${i < activeDests ? "#6C47FF" : "#2A2640"}`,
                      padding: "0 10px",
                      opacity: i < activeDests ? 1 : 0.3,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{d.emoji}</span>
                    <div>
                      <p style={{ fontSize: 11, lineHeight: 1.2 }}>{d.name}</p>
                      {i < activeDests && (
                        <p style={{ fontSize: 9, color: "#22C55E" }}>live ✓</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-[620px]"
              >
                <div
                  style={{
                    border: "1px solid #2A2640",
                    borderRadius: 10,
                    background: "#121024",
                    padding: 12,
                  }}
                >
                  <p style={{ fontSize: 11, color: "#6C47FF", letterSpacing: "0.08em", marginBottom: 8 }}>
                    campaign creation flow
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {CAMPAIGN_FLOW_STEPS.map((stepLabel, index) => {
                      const isActive = index < campaignFlowProgress
                      return (
                        <div
                          key={stepLabel}
                          style={{
                            border: `1px solid ${isActive ? "#6C47FF" : "#2A2640"}`,
                            borderRadius: 8,
                            padding: "8px 10px",
                            background: isActive ? "#1A1535" : "#0F0D1D",
                            opacity: isActive ? 1 : 0.55,
                            transition: "all 0.25s ease",
                          }}
                        >
                          <p style={{ fontSize: 10, color: isActive ? "#BBAAFF" : "#6F6A8A", marginBottom: 4 }}>
                            step {index + 1}
                          </p>
                          <p style={{ fontSize: 12, color: isActive ? "#DDD7FF" : "#9B97B5", lineHeight: 1.35 }}>
                            {stepLabel}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>

              {activeDests >= DESTINATIONS.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-4"
                >
                  <p style={{ fontSize: 18 }}>your car is everywhere.</p>
                  <p style={{ fontSize: 12, color: "#9B97B5", marginTop: 6 }}>
                    smart campaign + publishing + platform preview + smartview are now active.
                  </p>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => {
                      advanceFromStage("live")
                    }}
                    className="mt-4 cursor-pointer hover:underline bg-transparent border-none p-0"
                    style={{ fontSize: 14, color: "#6C47FF" }}
                  >
                    see what this means →
                  </motion.button>
                  <button
                    onClick={openCurrentStageExplainer}
                    className="mt-3 cursor-pointer hover:underline bg-transparent border-none p-0"
                    style={{ fontSize: 12, color: "#9B97B5" }}
                  >
                    open live explainer
                  </button>
                  <div className="mt-3 flex flex-wrap justify-center gap-2" style={{ maxWidth: 640 }}>
                    {stageFeatures.map((feature) => (
                      <button
                        key={feature.id}
                        onClick={() => openFeatureModal(feature.id)}
                        className="cursor-pointer bg-transparent border border-[#2A2640] text-[#9B97B5] hover:border-[#6C47FF] hover:text-white transition-colors duration-150"
                        style={{ padding: "4px 9px", borderRadius: 999, fontSize: 11 }}
                      >
                        open {feature.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* ──────── IMPACT ──────── */}
          {stage === "impact" && (
            <div
              className="min-h-screen flex flex-col items-center justify-center relative"
              style={{ paddingTop: 44 }}
            >
              <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 48 }}>
                here&apos;s what just happened.
              </h2>

              <div className="flex gap-16 mb-12">
                {[
                  { value: "47 min", label: "to go live, not 4 days" },
                  { value: `$${fourDayLoss}`, label: "holding cost you won't lose again", color: "#22C55E" },
                  { value: `${mockChannelsCount} platforms`, label: "publishing with one click" },
                  { value: "3.4×", label: "longer time on vdp with 360° view" },
                ].map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                    className="text-center"
                  >
                    <p
                      style={{
                        fontSize: 40,
                        fontWeight: 500,
                        color: m.color || "#fff",
                      }}
                    >
                      {m.value}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#9B97B5",
                        marginTop: 6,
                        maxWidth: 160,
                        lineHeight: 1.4,
                      }}
                    >
                      {m.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div
                className="w-full max-w-3xl"
                style={{ height: 1, background: "#2A2640" }}
              />

              <div
                className="w-full max-w-3xl mt-8"
                style={{ border: "1px solid #2A2640", borderRadius: 10, background: "#121024", padding: 14 }}
              >
                <p style={{ fontSize: 12, color: "#6C47FF", marginBottom: 8 }}>
                  next 90 days impact outlook for {mockDealerName} (dummy projection)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "aged units 45+ days",
                      current: `${mockAgedInventoryRate}%`,
                      improved: `${improvedAgedInventoryRate}%`,
                    },
                    {
                      label: "photo compliance",
                      current: `${mockPhotoComplianceRate}%`,
                      improved: `${improvedPhotoComplianceRate}%`,
                    },
                    {
                      label: "vdp to lead rate",
                      current: `${mockVdpToLeadRate}%`,
                      improved: `${improvedVdpToLeadRate}%`,
                    },
                  ].map((metric) => (
                    <div key={metric.label} style={{ border: "1px solid #2A2640", borderRadius: 8, padding: 10 }}>
                      <p style={{ fontSize: 10, color: "#6F6A8A", marginBottom: 8 }}>{metric.label}</p>
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: 12, color: "#9B97B5" }}>{metric.current}</span>
                        <span style={{ fontSize: 12, color: "#22C55E" }}>{metric.improved}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex w-full max-w-3xl mt-10">
                <div className="w-[60%] pr-8">
                  <p style={{ fontSize: 14, color: "#9B97B5", marginBottom: 12 }}>
                    want to see this on your actual inventory?
                  </p>
                  {!emailSent ? (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="your email"
                        className="outline-none"
                        style={{
                          width: 200,
                          height: 36,
                          background: "#1E1B2E",
                          border: "1px solid #2A2640",
                          color: "#fff",
                          padding: "0 12px",
                          borderRadius: 4,
                          fontSize: 13,
                        }}
                      />
                      <button
                        onClick={() => setEmailSent(true)}
                        className="cursor-pointer"
                        style={{
                          height: 36,
                          background: "#6C47FF",
                          color: "#fff",
                          padding: "0 16px",
                          border: "none",
                          borderRadius: 4,
                          fontSize: 13,
                        }}
                      >
                        book a demo
                      </button>
                    </div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ fontSize: 14, color: "#9B97B5" }}
                    >
                      we&apos;ll be in touch.
                    </motion.p>
                  )}
                </div>

                <div
                  className="w-[40%] pl-8"
                  style={{ borderLeft: "1px solid #2A2640" }}
                >
                  <p style={{ fontSize: 14, color: "#9B97B5", marginBottom: 12 }}>
                    share this demo
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText("spyne.ai/demo/quickshift")
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="cursor-pointer"
                    style={{
                      background: "#1E1B2E",
                      border: "1px solid #2A2640",
                      borderRadius: 4,
                      padding: "8px 14px",
                      fontSize: 12,
                      color: copied ? "#6C47FF" : "#9B97B5",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {copied ? "copied ✓" : "spyne.ai/demo/quickshift"}
                  </button>
                </div>
              </div>

              <p
                className="absolute bottom-6"
                style={{ fontSize: 11, color: "#3D3855" }}
              >
                this demo showed you 4 days of holding cost in ~3 minutes.
              </p>
              <div className="absolute bottom-6 right-8 flex gap-2">
                <button
                  onClick={openCurrentStageExplainer}
                  className="cursor-pointer"
                  style={{
                    height: 34,
                    background: "#6C47FF",
                    color: "#fff",
                    padding: "0 14px",
                    border: "none",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  open stage explainer
                </button>
                {stageFeatures.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => openFeatureModal(feature.id)}
                    className="cursor-pointer"
                    style={{
                      height: 34,
                      background: "#1E1B2E",
                      color: "#9B97B5",
                      padding: "0 14px",
                      border: "1px solid #2A2640",
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  >
                    open {feature.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    const replayStartStage = activeFlowId ? ENTRY_FLOWS[activeFlowId].startStage : "intake"
                    transitionToStage(replayStartStage)
                    setHoldingCost(0)
                    setCostStopped(false)
                    setTransformCount(0)
                    setProgress(0)
                    setActiveDests(0)
                    setEmailSent(false)
                    setCopied(false)
                  }}
                  className="cursor-pointer"
                  style={{
                    height: 34,
                    background: "#1E1B2E",
                    color: "#9B97B5",
                    padding: "0 14px",
                    border: "1px solid #2A2640",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  replay from data prep
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {!isPreJourney && (
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed right-6 top-14 z-30"
            style={{
              width: 240,
              background: "rgba(17, 15, 31, 0.94)",
              border: "1px solid #2A2640",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p style={{ fontSize: 11, color: "#9B97B5", letterSpacing: "0.08em" }}>feature coverage</p>
              <p style={{ fontSize: 11, color: "#6C47FF" }}>
                {coveredFeatures.length}/{FULL_FEATURES.length}
              </p>
            </div>
            <div style={{ height: 4, background: "#1E1B2E", marginBottom: 10, borderRadius: 999 }}>
              <div
                style={{
                  height: "100%",
                  width: `${(coveredFeatures.length / FULL_FEATURES.length) * 100}%`,
                  background: "#6C47FF",
                  borderRadius: 999,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FULL_FEATURES.map((feature) => {
                const isCovered = coveredFeatures.some((f) => f.id === feature.id)
                return (
                  <button
                    key={feature.id}
                    onClick={() => openFeatureModal(feature.id)}
                    style={{
                      fontSize: 10,
                      padding: "3px 7px",
                      borderRadius: 999,
                      border: `1px solid ${isCovered ? "#6C47FF" : "#2A2640"}`,
                      color: isCovered ? "#DDD7FF" : "#5F5A7A",
                      background: isCovered ? "#1A1535" : "transparent",
                      transition: "all 0.25s ease",
                      cursor: "pointer",
                      borderWidth: isCovered ? 1.5 : 1,
                    }}
                  >
                    {feature.label}
                  </button>
                )
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isPreJourney && vehicleCompareOpen && activeVehicleComparePair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(10, 9, 20, 0.78)", backdropFilter: "blur(6px)" }}
            onClick={() => setVehicleCompareOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(1120px, 96vw)",
                background: "#0F1326",
                color: "#fff",
                borderRadius: 22,
                border: "1px solid #2A2640",
                boxShadow: "0 30px 90px rgba(0,0,0,0.45)",
                overflow: "hidden",
              }}
            >
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #23213A" }}>
                <div>
                  <p style={{ fontSize: 11, color: "#9B97B5", letterSpacing: "0.08em" }}>VEHICLE BEFORE / AFTER</p>
                  <p style={{ fontSize: 20, fontWeight: 600, marginTop: 2 }}>{displayTitle}</p>
                </div>
                <button
                  onClick={() => setVehicleCompareOpen(false)}
                  className="cursor-pointer"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "#111827",
                    color: "#fff",
                    border: "1px solid #374151",
                    fontSize: 20,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 pt-5 pb-4">
                <div>
                  <p style={{ fontSize: 11, color: "#9B97B5", marginBottom: 8, letterSpacing: "0.06em" }}>BEFORE</p>
                  <div style={{ border: "1px solid #2A2640", borderRadius: 12, overflow: "hidden", background: "#090D1A" }}>
                    <img src={activeVehicleComparePair.before} alt={`${displayTitle} before`} className="h-72 w-full object-cover" />
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#A68BFF", marginBottom: 8, letterSpacing: "0.06em" }}>AFTER</p>
                  <div style={{ border: "1px solid #6C47FF", borderRadius: 12, overflow: "hidden", background: "#090D1A" }}>
                    <img src={activeVehicleComparePair.after} alt={`${displayTitle} after`} className="h-72 w-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6">
                <p style={{ fontSize: 11, color: "#6D6A84", marginBottom: 8 }}>select angle</p>
                <div className="grid grid-cols-8 gap-2">
                  {vehicleComparePairs.map((pair, index) => {
                    const selected = index === safeVehicleCompareIndex
                    return (
                      <button
                        key={pair.after}
                        onClick={() => setVehicleCompareIndex(index)}
                        className="cursor-pointer"
                        style={{
                          border: selected ? "1px solid #6C47FF" : "1px solid #2A2640",
                          borderRadius: 8,
                          overflow: "hidden",
                          padding: 0,
                          background: "#090D1A",
                        }}
                        aria-label={`show angle ${index + 1}`}
                      >
                        <img src={pair.after} alt={`Processed angle ${index + 1}`} className="h-14 w-full object-cover" />
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isPreJourney && modalFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(10, 9, 20, 0.72)", backdropFilter: "blur(6px)" }}
            onClick={() => setFeatureModalId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(860px, 94vw)",
                background: "#FFFFFF",
                color: "#111827",
                borderRadius: 28,
                border: "2px solid #2563EB",
                boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
                overflow: "hidden",
              }}
            >
              <div className="flex items-center justify-between px-7 pt-6 pb-3">
                <div>
                  <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 4, letterSpacing: "0.08em" }}>FEATURE EXPLAINER</p>
                  <h3 style={{ fontSize: 42, lineHeight: 1, fontWeight: 600 }}>
                    {FEATURE_ICONS[modalFeature.id] ?? "•"} {FEATURE_SPOTLIGHTS[modalFeature.id]?.title ?? modalFeature.label}
                  </h3>
                </div>
                <button
                  onClick={() => setFeatureModalId(null)}
                  className="cursor-pointer"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "#111827",
                    color: "#fff",
                    border: "none",
                    fontSize: 20,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-[1.2fr_0.8fr] gap-4 px-7 pb-5">
                <div
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 16,
                    background: "#F9FAFB",
                    padding: 16,
                  }}
                >
                  <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>what to say</p>
                  <p style={{ fontSize: 20, lineHeight: 1.25, fontWeight: 550, marginBottom: 10 }}>
                    This capability {FEATURE_VALUE_LINES[modalFeature.id] ?? "delivers measurable value"}.
                  </p>
                  {(FEATURE_SPOTLIGHTS[modalFeature.id]?.details ?? []).map((detail) => (
                    <p key={detail} style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.5, marginBottom: 4 }}>
                      • {detail}
                    </p>
                  ))}
                </div>

                <div className="grid grid-rows-2 gap-4">
                  <div
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 16,
                      padding: 14,
                    }}
                  >
                    <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>current stage</p>
                    <p style={{ fontSize: 28, fontWeight: 600, textTransform: "capitalize" }}>{modalFeature.stage}</p>
                    <p style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
                      tap to align your answer with what customer is seeing.
                    </p>
                  </div>
                  <div
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 16,
                      padding: 14,
                    }}
                  >
                    <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>ae prompt</p>
                    <p style={{ fontSize: 14, lineHeight: 1.4, fontWeight: 500 }}>
                      "This is where we prove {FEATURE_SPOTLIGHTS[modalFeature.id]?.title ?? modalFeature.label} in live workflow."
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-7 pb-4">
                <div className="grid grid-cols-3 gap-3">
                  <div
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 14,
                      padding: 12,
                      background: "#FFFFFF",
                    }}
                  >
                    <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>
                      {modalCoverage?.primaryLabel ?? "coverage elements"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(modalCoverage?.primaryItems ?? (FEATURE_SPOTLIGHTS[modalFeature.id]?.details ?? [])).map((item) => (
                        <span
                          key={item}
                          style={{
                            fontSize: 11,
                            padding: "3px 8px",
                            borderRadius: 999,
                            border: "1px solid #D1D5DB",
                            background: "#F9FAFB",
                            color: "#374151",
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 14,
                      padding: 12,
                      background: "#FFFFFF",
                    }}
                  >
                    <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>
                      {modalCoverage?.secondaryLabel ?? "implementation details"}
                    </p>
                    {(modalCoverage?.secondaryItems ?? ["live demo aligned to current stage", "one-click jump to proof moment"]).map((item) => (
                      <p key={item} style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.5, marginBottom: 4 }}>
                        • {item}
                      </p>
                    ))}
                  </div>

                  <div
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 14,
                      padding: 12,
                      background: "#FFFFFF",
                    }}
                  >
                    <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>proof metrics</p>
                    {(modalCoverage?.metrics ?? [
                      { label: "stage", value: modalFeature.stage },
                      { label: "feature", value: "enabled" },
                    ]).map((metric) => (
                      <div key={metric.label} className="flex items-end justify-between" style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: "#6B7280" }}>{metric.label}</span>
                        <span style={{ fontSize: 18, fontWeight: 600 }}>{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-7 pb-3 flex items-center justify-between">
                <button
                  onClick={() => {
                    transitionToStage(modalFeature.stage, null)
                    setFeatureModalId(modalFeature.id)
                  }}
                  className="cursor-pointer"
                  style={{
                    height: 34,
                    borderRadius: 999,
                    background: "#111827",
                    color: "#fff",
                    border: "none",
                    padding: "0 14px",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  show this stage now
                </button>
                <div className="flex items-center gap-2">
                  {FULL_FEATURES.filter((feature) => feature.stage === modalFeature.stage).map((feature) => {
                    const active = feature.id === modalFeature.id
                    return (
                      <button
                        key={feature.id}
                        onClick={() => setFeatureModalId(feature.id)}
                        style={{
                          borderRadius: 999,
                          border: `1px solid ${active ? "#111827" : "#D1D5DB"}`,
                          background: active ? "#111827" : "#fff",
                          color: active ? "#fff" : "#374151",
                          padding: "5px 10px",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        {FEATURE_ICONS[feature.id] ?? "•"} {feature.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="px-7 pb-6">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => cycleModalFeature("prev")}
                    className="cursor-pointer"
                    aria-label="Previous feature"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      border: "1px solid #D1D5DB",
                      background: "#FFFFFF",
                      color: "#374151",
                      flexShrink: 0,
                    }}
                  >
                    ←
                  </button>
                  <button
                    onClick={() => cycleModalFeature("next")}
                    className="cursor-pointer"
                    aria-label="Next feature"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      border: "1px solid #D1D5DB",
                      background: "#FFFFFF",
                      color: "#374151",
                      flexShrink: 0,
                    }}
                  >
                    →
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isPreJourney && (
          <>
            {!faqOpen && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={() => setFaqOpen(true)}
                className="fixed bottom-6 left-6 z-40 cursor-pointer"
                style={{
                  height: 36,
                  background: "#1A1535",
                  color: "#DDD7FF",
                  border: "1px solid #6C47FF",
                  borderRadius: 18,
                  padding: "0 14px",
                  fontSize: 12,
                }}
              >
                ae faq mode • {faqStage}
              </motion.button>
            )}

            {faqOpen && activeFaq && (
              <motion.aside
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.25 }}
                className="fixed left-6 bottom-6 right-6 z-40"
                style={{
                  maxWidth: 980,
                  background: "rgba(17, 15, 31, 0.97)",
                  border: "1px solid #2A2640",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p style={{ fontSize: 12, color: "#DDD7FF" }}>AE FAQ Copilot</p>
                    <span
                      style={{
                        fontSize: 10,
                        color: "#9B97B5",
                        border: "1px solid #2A2640",
                        borderRadius: 999,
                        padding: "2px 8px",
                      }}
                    >
                      stage: {faqStage}
                    </span>
                  </div>
                  <button
                    onClick={() => setFaqOpen(false)}
                    style={{
                      fontSize: 11,
                      color: "#9B97B5",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    close
                  </button>
                </div>

                <div className="grid grid-cols-[280px_1fr] gap-3">
                  <div style={{ borderRight: "1px solid #2A2640", paddingRight: 10 }}>
                    <p style={{ fontSize: 11, color: "#5F5A7A", marginBottom: 8 }}>common customer questions</p>
                    <div className="flex flex-col gap-1.5">
                      {currentFaqs.map((faq) => {
                        const isActive = faq.id === activeFaq.id
                        return (
                          <button
                            key={faq.id}
                            onClick={() => setActiveFaqId(faq.id)}
                            style={{
                              textAlign: "left",
                              fontSize: 12,
                              lineHeight: 1.4,
                              padding: "8px 9px",
                              borderRadius: 6,
                              border: `1px solid ${isActive ? "#6C47FF" : "#2A2640"}`,
                              background: isActive ? "#1A1535" : "transparent",
                              color: isActive ? "#DDD7FF" : "#9B97B5",
                              cursor: "pointer",
                            }}
                          >
                            {faq.question}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 14, color: "#fff", marginBottom: 8 }}>{activeFaq.question}</p>
                    <div
                      style={{
                        border: "1px solid #2A2640",
                        borderRadius: 8,
                        background: "#121024",
                        padding: 10,
                        marginBottom: 10,
                      }}
                    >
                      <p style={{ fontSize: 11, color: "#5F5A7A", marginBottom: 4 }}>direct answer</p>
                      <p style={{ fontSize: 13, color: "#DDD7FF", lineHeight: 1.5 }}>{activeFaq.shortAnswer}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p style={{ fontSize: 11, color: "#5F5A7A", marginBottom: 6 }}>talk track</p>
                        {activeFaq.talkTrack.map((line) => (
                          <p key={line} style={{ fontSize: 12, color: "#9B97B5", lineHeight: 1.45, marginBottom: 4 }}>
                            • {line}
                          </p>
                        ))}
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: "#5F5A7A", marginBottom: 6 }}>proof points</p>
                        {activeFaq.proofPoints.map((point) => (
                          <p key={point} style={{ fontSize: 12, color: "#9B97B5", lineHeight: 1.45, marginBottom: 4 }}>
                            • {point}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => jumpToFeature(activeFaq.relatedFeatureId)}
                        className="cursor-pointer"
                        style={{
                          height: 30,
                          background: "#6C47FF",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "0 10px",
                          fontSize: 11,
                        }}
                      >
                        show this in demo
                      </button>
                      <button
                        onClick={() => openFeatureModal(activeFaq.relatedFeatureId)}
                        className="cursor-pointer"
                        style={{
                          height: 30,
                          background: "transparent",
                          color: "#9B97B5",
                          border: "1px solid #2A2640",
                          borderRadius: 4,
                          padding: "0 10px",
                          fontSize: 11,
                        }}
                      >
                        open explain modal
                      </button>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
