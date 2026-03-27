"use client"

import { type ChangeEvent, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Loader2,
  MessageSquare,
  Presentation,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  Upload,
  Zap,
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════

type RunState = "idle" | "processing" | "done"
type OutputMode = "onePager" | "deck"
type NarrativeTone = "aggressive" | "consultative" | "executive"
type ConfidenceLevel = "grounded" | "assumption-aided" | "thin"

interface UploadItem {
  id: string
  name: string
  sizeKb: number
}

interface SmartMatchCandidate {
  makeModel: string
  missingUnits: number
  priority: "high" | "medium" | "low"
  action: string
}

interface DeepQuestion {
  id: string
  label: string
  type: "text" | "number" | "select"
  options?: string[]
  placeholder?: string
}

interface DeepSection {
  id: string
  title: string
  icon: React.ElementType
  questions: DeepQuestion[]
}

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════

const CALL_STAGES = [
  "Prospecting",
  "First call",
  "Demo booked",
  "Post-demo follow-up",
]
const AE_GOALS = [
  "Book pilot",
  "Close blocker",
  "Improve confidence",
  "Re-activate stalled deal",
]

const PROCESSING_LABELS = [
  "Analyzing website signals\u2026",
  "Diagnosing image quality\u2026",
  "Computing Smart Match logic\u2026",
  "Generating narrative\u2026",
  "Finalizing briefing\u2026",
]

const DEEP_SECTIONS: DeepSection[] = [
  {
    id: "account",
    title: "Account Context",
    icon: Building2,
    questions: [
      {
        id: "companySize",
        label: "Company size",
        type: "select",
        options: ["1\u201350 employees", "50\u2013200", "200+"],
      },
      {
        id: "annualRevenue",
        label: "Revenue range",
        type: "select",
        options: ["<$10M", "$10M\u2013$50M", "$50M\u2013$200M", "$200M+"],
      },
      {
        id: "dmsProvider",
        label: "DMS provider",
        type: "text",
        placeholder: "e.g. CDK, Reynolds",
      },
      {
        id: "customerDemo",
        label: "Customer demographic",
        type: "select",
        options: ["Retail buyers", "Fleet / Commercial", "Mixed"],
      },
      {
        id: "geoFootprint",
        label: "Geographic footprint",
        type: "select",
        options: ["Single market", "Regional", "Multi-state"],
      },
      {
        id: "competitiveIntensity",
        label: "Competitive landscape",
        type: "select",
        options: ["Low", "Moderate", "High", "Intense"],
      },
    ],
  },
  {
    id: "metrics",
    title: "Operating Metrics",
    icon: BarChart3,
    questions: [
      {
        id: "rooftopCount",
        label: "Rooftop count",
        type: "number",
        placeholder: "e.g. 8",
      },
      {
        id: "monthlyCars",
        label: "Monthly cars listed / sold",
        type: "number",
        placeholder: "e.g. 420",
      },
      {
        id: "avgDaysOnLot",
        label: "Average days on lot",
        type: "number",
        placeholder: "e.g. 42",
      },
      {
        id: "monthlyAdSpend",
        label: "Monthly ad spend",
        type: "select",
        options: ["<$10K", "$10K\u2013$50K", "$50K\u2013$100K", "$100K+"],
      },
      {
        id: "costPerLead",
        label: "Cost per lead ($)",
        type: "number",
        placeholder: "e.g. 35",
      },
      {
        id: "holdingCostPerDay",
        label: "Holding cost / vehicle / day ($)",
        type: "number",
        placeholder: "e.g. 45",
      },
      {
        id: "fullImageSetPct",
        label: "% listings with full image set",
        type: "number",
        placeholder: "e.g. 58",
      },
    ],
  },
  {
    id: "merchandising",
    title: "Digital Merchandising",
    icon: Camera,
    questions: [
      {
        id: "listingCoverage",
        label: "Listing image coverage",
        type: "select",
        options: ["High", "Partial", "Low"],
      },
      {
        id: "avgPhotos",
        label: "Avg photos per listing",
        type: "number",
        placeholder: "e.g. 24",
      },
      {
        id: "timeToLive",
        label: "Acquisition \u2192 live (days)",
        type: "number",
        placeholder: "e.g. 5",
      },
      {
        id: "platforms",
        label: "Primary listing platforms",
        type: "text",
        placeholder: "e.g. Dealer.com, AutoTrader, Cars.com",
      },
      {
        id: "videoUsage",
        label: "Video on listings",
        type: "select",
        options: ["None", "Some", "Most", "All"],
      },
      {
        id: "threeSixty",
        label: "360\u00b0 capability",
        type: "select",
        options: ["None", "Partial", "Full"],
      },
      {
        id: "bgEditing",
        label: "Background editing",
        type: "select",
        options: ["None", "Manual", "Automated", "Outsourced"],
      },
    ],
  },
  {
    id: "strategy",
    title: "Deal Strategy",
    icon: Target,
    questions: [
      {
        id: "decisionMaker",
        label: "Decision maker",
        type: "text",
        placeholder: "e.g. GM, Dealer Principal",
      },
      {
        id: "budgetCycle",
        label: "Budget cycle",
        type: "select",
        options: ["Q1", "Q2", "Q3", "Q4", "Rolling"],
      },
      {
        id: "prevVendor",
        label: "Previous vendor experience",
        type: "text",
        placeholder: "Past photo vendors",
      },
      {
        id: "keyObjections",
        label: "Key objections heard",
        type: "text",
        placeholder: "e.g. Cost, complexity",
      },
      {
        id: "competitiveAlts",
        label: "Alternatives evaluated",
        type: "text",
        placeholder: "e.g. HomeNet, CarCutter",
      },
    ],
  },
]

const OBJECTION_SNIPPETS = [
  {
    objection: "We already have a photographer",
    response:
      "Spyne doesn\u2019t replace your photographer \u2014 it accelerates their output, ensures consistency across locations, and fills gaps when they can\u2019t cover every vehicle.",
    whatToSay:
      "How many vehicles does your photographer cover per day? We typically help teams 3x that throughput without changing workflow.",
  },
  {
    objection: "Budget is locked this quarter",
    response:
      "The pilot proves ROI within 30 days \u2014 concrete numbers before any budget decision. Many dealers fund this from their existing photography budget.",
    whatToSay:
      "What if we could show measurable improvement within your current spend? That\u2019s exactly what the 30-day pilot proves.",
  },
  {
    objection: "Need to check with our GM",
    response:
      "That\u2019s why we create a shareable briefing link \u2014 gives your GM the complete picture in 2 minutes without a separate meeting.",
    whatToSay:
      "I\u2019ll send a briefing link with everything your GM needs. Can we schedule a 15-minute check-in after they\u2019ve reviewed it?",
  },
  {
    objection: "Current process works fine",
    response:
      "Your process has strengths. We\u2019re showing the gap between \u2018works\u2019 and \u2018optimized\u2019 \u2014 vehicles with incomplete coverage represent real revenue opportunity.",
    whatToSay:
      "I hear you. Based on what we see, there\u2019s a meaningful monthly opportunity in your image workflow. Worth a 30-day pilot to verify?",
  },
]

// ═══════════════════════════════════════════════════════════════
//  SCORE RING
// ═══════════════════════════════════════════════════════════════

function ScoreRing({
  score,
  size = 88,
  strokeWidth = 7,
}: {
  score: number
  size?: number
  strokeWidth?: number
}) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color =
    score >= 75 ? "#22c55e" : score >= 55 ? "#eab308" : "#ef4444"

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ strokeDasharray: `${circ}` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 28 },
  },
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function DemoConsoleV5Page() {
  // ─── Quick inputs ───
  const [dealerName, setDealerName] = useState("Desert Valley Auto Group")
  const [dealerUrl, setDealerUrl] = useState(
    "https://desertvalley.example.com",
  )
  const [callStage, setCallStage] = useState("Demo booked")
  const [aeGoal, setAeGoal] = useState("Book pilot")
  const [knownBlocker, setKnownBlocker] = useState(
    "Inconsistent images across rooftops",
  )

  // ─── Deep inputs ───
  const [deep, setDeep] = useState<Record<string, string>>({})
  const updateDeep = (id: string, v: string) =>
    setDeep((p) => ({ ...p, [id]: v }))

  // ─── Evidence ───
  const [rawImages, setRawImages] = useState<UploadItem[]>([])
  const [webShots, setWebShots] = useState<UploadItem[]>([])
  const rawRef = useRef<HTMLInputElement>(null)
  const webRef = useRef<HTMLInputElement>(null)

  // ─── State ───
  const [runState, setRunState] = useState<RunState>("idle")
  const [stage, setStage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [outputMode, setOutputMode] = useState<OutputMode>("onePager")
  const [tone, setTone] = useState<NarrativeTone>("consultative")
  const [presenter, setPresenter] = useState(false)
  const [copied, setCopied] = useState(false)

  const setupReady =
    dealerName.trim().length > 2 && dealerUrl.trim().length > 5

  // ─── Confidence ───
  const deepFilledCount = useMemo(
    () => Object.values(deep).filter((v) => v.trim().length > 0).length,
    [deep],
  )
  const totalDeepQ = DEEP_SECTIONS.reduce(
    (a, s) => a + s.questions.length,
    0,
  )

  const confidenceScore = useMemo(() => {
    const q = [dealerName, dealerUrl, callStage, aeGoal, knownBlocker].filter(
      (v) => v.trim().length > 0,
    ).length
    return Math.min(
      100,
      Math.round(
        (q / 5) * 40 +
          (deepFilledCount / totalDeepQ) * 40 +
          (rawImages.length > 0 ? 10 : 0) +
          (webShots.length > 0 ? 10 : 0),
      ),
    )
  }, [
    dealerName,
    dealerUrl,
    callStage,
    aeGoal,
    knownBlocker,
    deepFilledCount,
    totalDeepQ,
    rawImages.length,
    webShots.length,
  ])

  const confidence: ConfidenceLevel =
    confidenceScore > 65
      ? "grounded"
      : confidenceScore > 35
        ? "assumption-aided"
        : "thin"

  // ─── Metrics (safe defaults, deep inputs override) ───
  const rooftops = Number(deep.rooftopCount) || 8
  const monthlyCars = Number(deep.monthlyCars) || 420
  const holdingCost = Number(deep.holdingCostPerDay) || 45
  const fullImagePct = Number(deep.fullImageSetPct) || 58
  const avgPhotos = Number(deep.avgPhotos) || 18
  const timeToLive = Number(deep.timeToLive) || 5
  const listingCoverage = deep.listingCoverage || "Partial"

  // ─── Website Analysis ───
  const websiteScore = useMemo(() => {
    const base =
      listingCoverage === "High"
        ? 78
        : listingCoverage === "Partial"
          ? 57
          : 34
    const photoBoost =
      avgPhotos > 30 ? 8 : avgPhotos > 20 ? 4 : avgPhotos < 12 ? -5 : 0
    const ttlBoost =
      timeToLive < 3 ? 6 : timeToLive < 5 ? 3 : timeToLive > 7 ? -4 : 0
    const threeSixtyBoost =
      deep.threeSixty === "Full" ? 5 : deep.threeSixty === "Partial" ? 2 : 0
    const videoBoost =
      deep.videoUsage === "All" ? 5 : deep.videoUsage === "Most" ? 3 : 0
    const bgBoost =
      deep.bgEditing === "Automated"
        ? 5
        : deep.bgEditing === "Outsourced"
          ? 3
          : 0
    const evidenceBoost = Math.min(6, rawImages.length + webShots.length)
    return Math.max(
      25,
      Math.min(
        95,
        base +
          photoBoost +
          ttlBoost +
          threeSixtyBoost +
          videoBoost +
          bgBoost +
          evidenceBoost,
      ),
    )
  }, [
    listingCoverage,
    avgPhotos,
    timeToLive,
    deep.threeSixty,
    deep.videoUsage,
    deep.bgEditing,
    rawImages.length,
    webShots.length,
  ])

  const websiteDimensions = useMemo(
    () => [
      {
        label: "Listing image coverage",
        score:
          listingCoverage === "High"
            ? 85
            : listingCoverage === "Partial"
              ? 58
              : 28,
      },
      {
        label: "Website consistency",
        score: Math.min(90, websiteScore + 8),
      },
      { label: "CTA clarity", score: Math.min(88, websiteScore + 5) },
      {
        label: "Mobile readiness",
        score: Math.min(92, websiteScore + 12),
      },
      {
        label: "Trust signals",
        score: Math.max(30, websiteScore - 6),
      },
    ],
    [websiteScore, listingCoverage],
  )

  const hasListingImages = listingCoverage !== "Low"

  // ─── Image Analysis ───
  const imageIssues = useMemo(() => {
    const issues: string[] = []
    if (rawImages.length < 4)
      issues.push(
        "Low sample volume \u2014 evidence confidence is medium (assumption-aided).",
      )
    if (!hasListingImages)
      issues.push(
        "Critical: listings likely missing image sets on website.",
      )
    if (fullImagePct < 60)
      issues.push(
        "Angle coverage inconsistency \u2014 exterior and focus shots incomplete.",
      )
    issues.push(
      "Mixed quality due to distributed capture process across locations.",
    )
    if (fullImagePct < 70)
      issues.push(
        "Likely blur / framing defects creating downstream rework.",
      )
    return issues
  }, [rawImages.length, hasListingImages, fullImagePct])

  const imageConfidence =
    rawImages.length >= 5
      ? "high"
      : rawImages.length >= 2
        ? "medium"
        : "assumption-aided"

  // ─── Smart Match ───
  const smartMatchTriggered = !hasListingImages || fullImagePct < 72

  const smartMatchCandidates = useMemo<SmartMatchCandidate[]>(() => {
    const m = rooftops > 6 ? 1.2 : 1
    return [
      {
        makeModel: "Toyota Camry",
        missingUnits: Math.max(4, Math.round(10 * m)),
        priority: "high",
        action:
          "Clone best-performing studio set and apply look-alike matching by trim.",
      },
      {
        makeModel: "Honda Civic",
        missingUnits: Math.max(3, Math.round(8 * m)),
        priority: "medium",
        action:
          "Recover missing angle coverage and normalize background consistency.",
      },
      {
        makeModel: "Hyundai Tucson",
        missingUnits: Math.max(2, Math.round(5 * m)),
        priority: "low",
        action:
          "Fill remaining listing gaps for high-impression VDP pages.",
      },
      {
        makeModel: "Ford F-150",
        missingUnits: Math.max(3, Math.round(7 * m)),
        priority: "high",
        action:
          "Priority recovery \u2014 high-demand segment with visible coverage gaps.",
      },
    ]
  }, [rooftops])

  const totalMissingUnits = smartMatchCandidates.reduce(
    (a, c) => a + c.missingUnits,
    0,
  )

  // ─── Impact ───
  const carsAtRisk = Math.round(
    monthlyCars *
      (fullImagePct < 60 ? 0.38 : fullImagePct < 72 ? 0.28 : 0.18),
  )
  const monthlyRisk = carsAtRisk * holdingCost * 2
  const recoverable = Math.round(monthlyRisk * 0.32)

  // ─── Share link ───
  const shareLink = useMemo(() => {
    const slug = dealerName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    return `https://demo.spyne.ai/briefing/${slug || "dealer"}-v5`
  }, [dealerName])

  // ─── Tone-aware narrative ───
  const openers = useMemo(() => {
    const map: Record<NarrativeTone, string[]> = {
      aggressive: [
        `Every day without action, you\u2019re bleeding momentum on ~${carsAtRisk} vehicles.`,
        `Your website quality signal is ${websiteScore}/100 \u2014 buyers are leaving before they ever reach your CTA.`,
        `A focused pilot can recover $${recoverable.toLocaleString()}/month. The question is how fast you want to move.`,
      ],
      consultative: [
        `Our analysis suggests approximately ${carsAtRisk} vehicles per month are experiencing reduced buyer engagement due to visual coverage gaps.`,
        `Your website quality signal is ${websiteScore}/100, which indicates an opportunity to improve buyer confidence before call-to-action.`,
        `A focused 30-day pilot can recover approximately $${recoverable.toLocaleString()}/month in measurable impact.`,
      ],
      executive: [
        `Key metric: ${carsAtRisk} vehicles/month under-performing due to visual coverage gaps.`,
        `Website score: ${websiteScore}/100. Below top-quartile threshold for high-intent conversion.`,
        `Recovery opportunity: $${recoverable.toLocaleString()}/month within 30-day pilot window.`,
      ],
    }
    return map[tone]
  }, [tone, carsAtRisk, websiteScore, recoverable])

  const punchline = useMemo(() => {
    if (tone === "aggressive")
      return `${dealerName} is losing real money \u2014 ~${carsAtRisk} cars monthly stalling due to image gaps across ${rooftops} rooftops. A 30-day pilot recovers ~$${recoverable.toLocaleString()}/month.`
    if (tone === "executive")
      return `${dealerName}: ${carsAtRisk} cars/month at risk. ${rooftops} rooftops. $${recoverable.toLocaleString()}/month recoverable in 30 days.`
    return `${dealerName} is likely losing momentum on ~${carsAtRisk} cars monthly due to visual coverage and speed-to-live gaps across ${rooftops} rooftops. A focused 30-day pilot can recover approximately $${recoverable.toLocaleString()}/month.`
  }, [tone, dealerName, carsAtRisk, rooftops, recoverable])

  // ─── Deck slides ───
  const deckSlides = useMemo(
    () => [
      {
        title: "Why This Meeting Matters Now",
        points: [
          `${dealerName} is at an inflection point in buyer experience.`,
          "Market leaders are investing in image quality as competitive advantage.",
        ],
        accent: "border-l-purple-500",
      },
      {
        title: "Website & Listing Analysis",
        points: [
          `Website quality signal: ${websiteScore}/100`,
          `Listing images: ${hasListingImages ? "Present but inconsistent" : "Critical gaps detected"}`,
        ],
        accent: "border-l-blue-500",
      },
      {
        title: "Image Quality & Coverage Diagnosis",
        points: [
          `${fullImagePct}% of listings have full image set`,
          `Evidence confidence: ${imageConfidence}`,
          `${imageIssues.length} issues identified`,
        ],
        accent: "border-l-amber-500",
      },
      {
        title: "Smart Match Recovery Plan",
        points: [
          `${smartMatchTriggered ? "Triggered" : "Not triggered"} \u2014 ${totalMissingUnits} units recoverable`,
          `${smartMatchCandidates.length} make/model buckets identified`,
        ],
        accent: "border-l-green-500",
      },
      {
        title: "Business Impact & Recovery Opportunity",
        points: [
          `${carsAtRisk} cars at risk monthly`,
          `$${monthlyRisk.toLocaleString()} monthly exposure`,
          `$${recoverable.toLocaleString()} recoverable with pilot`,
        ],
        accent: "border-l-red-500",
      },
      {
        title: "30-Day Pilot Plan",
        points: [
          "Week 1: Baseline + priority model buckets",
          "Week 2\u20133: Smart Match recovery + integration",
          "Week 4: Review lift + scale decision",
        ],
        accent: "border-l-indigo-500",
      },
      {
        title: "Projected Results",
        points: [
          "Improved listing consistency across all rooftops",
          `Estimated $${recoverable.toLocaleString()}/month recovery`,
          "Reduced time-to-live by 40\u201360%",
        ],
        accent: "border-l-teal-500",
      },
      {
        title: "Next Steps & Commitment",
        points: [
          `Confirm ${deep.decisionMaker || "decision maker"} as pilot sponsor`,
          "Lock pilot start date: next Monday",
          "Share briefing for internal alignment",
        ],
        accent: "border-l-orange-500",
      },
    ],
    [
      dealerName,
      websiteScore,
      hasListingImages,
      fullImagePct,
      imageConfidence,
      imageIssues.length,
      smartMatchTriggered,
      totalMissingUnits,
      smartMatchCandidates.length,
      carsAtRisk,
      monthlyRisk,
      recoverable,
      deep.decisionMaker,
    ],
  )

  // ─── Handlers ───
  function onUpload(
    e: ChangeEvent<HTMLInputElement>,
    setter: (items: UploadItem[]) => void,
  ) {
    const files = e.target.files
    if (!files) return
    setter(
      Array.from(files).map((f, i) => ({
        id: `${f.name}-${i}`,
        name: f.name,
        sizeKb: Math.max(1, Math.round(f.size / 1024)),
      })),
    )
  }

  function runAnalysis() {
    if (!setupReady) return
    setRunState("processing")
    setProgress(0)
    setStage(0)
    setTimeout(() => setStage(1), 300)
    setTimeout(() => setStage(2), 600)
    setTimeout(() => setStage(3), 900)
    setTimeout(() => setStage(4), 1200)
    let step = 0
    const iv = setInterval(() => {
      step++
      setProgress(Math.round((step / 50) * 100))
      if (step >= 50) {
        clearInterval(iv)
        setTimeout(() => setRunState("done"), 80)
      }
    }, 30)
  }

  function refineAnalysis() {
    setRunState("processing")
    setProgress(0)
    setStage(0)
    setTimeout(() => setStage(1), 150)
    setTimeout(() => setStage(2), 300)
    setTimeout(() => setStage(3), 500)
    setTimeout(() => setStage(4), 650)
    let step = 0
    const iv = setInterval(() => {
      step++
      setProgress(Math.round((step / 25) * 100))
      if (step >= 25) {
        clearInterval(iv)
        setTimeout(() => setRunState("done"), 50)
      }
    }, 30)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard not available in demo context */
    }
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
  const labelCls = "text-xs font-medium text-muted-foreground"

  // ═══════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* ─── Mission Strip ─── */}
      <div className="border-b border-white/10 bg-gradient-to-r from-slate-950 via-[#1a0a3e] to-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-purple-300 font-medium">
                  Demo Console 5.0
                </span>
              </div>
              <h1 className={cn("font-semibold text-white tracking-tight", presenter ? "text-2xl" : "text-xl")}>
                First-Layer Demo Copilot
              </h1>
              <p className={cn("text-slate-400 mt-1", presenter ? "text-base" : "text-sm")}>
                Built for meetings where context is thin and conviction matters.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "text-xs border",
                  confidence === "grounded"
                    ? "bg-green-500/20 text-green-300 border-green-400/30"
                    : confidence === "assumption-aided"
                      ? "bg-amber-500/20 text-amber-300 border-amber-400/30"
                      : "bg-red-500/20 text-red-300 border-red-400/30",
                )}
              >
                {confidence === "grounded" ? "Grounded Mode" : confidence === "assumption-aided" ? "Assumption Mode" : "Thin Evidence"}
              </Badge>
              {smartMatchTriggered && (
                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs">Smart Match ON</Badge>
              )}
              <button
                onClick={() => setPresenter(!presenter)}
                className="ml-2 rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title={presenter ? "Exit presenter mode" : "Presenter mode"}
              >
                {presenter ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Grid ─── */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* ════════ LEFT: MAIN FLOW ════════ */}
          <div className="space-y-5">
            {/* ── A. Quick Start ── */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/10 text-primary">
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <CardTitle className={presenter ? "text-lg" : "text-base"}>Quick Start</CardTitle>
                  <Badge variant="outline" className="ml-auto text-[10px]">~90 seconds</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="space-y-1.5">
                    <span className={labelCls}>Dealer / group name</span>
                    <input value={dealerName} onChange={(e) => setDealerName(e.target.value)} className={inputCls} />
                  </label>
                  <label className="space-y-1.5">
                    <span className={labelCls}>Dealership URL</span>
                    <input value={dealerUrl} onChange={(e) => setDealerUrl(e.target.value)} className={inputCls} />
                  </label>
                  <label className="space-y-1.5">
                    <span className={labelCls}>Call stage</span>
                    <select value={callStage} onChange={(e) => setCallStage(e.target.value)} className={inputCls}>
                      {CALL_STAGES.map((s) => (<option key={s}>{s}</option>))}
                    </select>
                  </label>
                  <label className="space-y-1.5">
                    <span className={labelCls}>AE goal for this call</span>
                    <select value={aeGoal} onChange={(e) => setAeGoal(e.target.value)} className={inputCls}>
                      {AE_GOALS.map((g) => (<option key={g}>{g}</option>))}
                    </select>
                  </label>
                  <label className="space-y-1.5 md:col-span-2">
                    <span className={labelCls}>Known blocker or objection</span>
                    <input value={knownBlocker} onChange={(e) => setKnownBlocker(e.target.value)} className={inputCls} />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* ── B. Deep Context ── */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/10 text-primary">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <CardTitle className={presenter ? "text-lg" : "text-base"}>Deep Context</CardTitle>
                  <span className="text-xs text-muted-foreground ml-1">(optional &mdash; enriches output)</span>
                  {deepFilledCount > 0 && (
                    <Badge variant="outline" className="ml-auto text-[10px]">{deepFilledCount}/{totalDeepQ} filled</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Accordion type="multiple" className="w-full">
                  {DEEP_SECTIONS.map((section) => {
                    const SectionIcon = section.icon
                    const filled = section.questions.filter((q) => (deep[q.id] || "").trim().length > 0).length
                    return (
                      <AccordionItem key={section.id} value={section.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <SectionIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{section.title}</span>
                            {filled > 0 && <span className="text-[10px] text-primary font-normal">{filled}/{section.questions.length}</span>}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {section.questions.map((q) => (
                              <label key={q.id} className="space-y-1.5">
                                <span className={labelCls}>{q.label}</span>
                                {q.type === "select" ? (
                                  <select value={deep[q.id] || ""} onChange={(e) => updateDeep(q.id, e.target.value)} className={inputCls}>
                                    <option value="">Select&hellip;</option>
                                    {q.options!.map((o) => (<option key={o}>{o}</option>))}
                                  </select>
                                ) : (
                                  <input type={q.type} value={deep[q.id] || ""} onChange={(e) => updateDeep(q.id, e.target.value)} placeholder={q.placeholder} className={inputCls} />
                                )}
                              </label>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </CardContent>
            </Card>

            {/* ── C. Evidence Upload ── */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/10 text-primary">
                    <Upload className="h-3.5 w-3.5" />
                  </div>
                  <CardTitle className={presenter ? "text-lg" : "text-base"}>Evidence Upload</CardTitle>
                  <span className="text-xs text-muted-foreground ml-1">(strengthens confidence)</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div onClick={() => rawRef.current?.click()} className="group rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-all cursor-pointer p-6 text-center hover:bg-primary/[0.02]">
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/40 group-hover:text-primary/60 transition-colors mb-2" />
                    <p className="text-sm font-medium">Sample vehicle images</p>
                    <p className="text-xs text-muted-foreground mt-1">{rawImages.length > 0 ? `${rawImages.length} files selected` : "Click to upload or drag & drop"}</p>
                    <input ref={rawRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onUpload(e, setRawImages)} />
                  </div>
                  <div onClick={() => webRef.current?.click()} className="group rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-all cursor-pointer p-6 text-center hover:bg-primary/[0.02]">
                    <Globe className="h-8 w-8 mx-auto text-muted-foreground/40 group-hover:text-primary/60 transition-colors mb-2" />
                    <p className="text-sm font-medium">Website screenshots</p>
                    <p className="text-xs text-muted-foreground mt-1">{webShots.length > 0 ? `${webShots.length} files selected` : "Click to upload or drag & drop"}</p>
                    <input ref={webRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onUpload(e, setWebShots)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Central CTA ── */}
            <div className="flex justify-center py-2">
              {runState === "idle" ? (
                <Button disabled={!setupReady} onClick={runAnalysis} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-10 text-base shadow-lg shadow-primary/20">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Briefing
                </Button>
              ) : runState === "processing" ? (
                <Button disabled size="lg" className="h-12 px-10 text-base">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing&hellip;
                </Button>
              ) : (
                <Button onClick={refineAnalysis} variant="outline" size="lg" className="h-12 px-10 text-base">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Refine Briefing
                </Button>
              )}
            </div>

            {/* ── Processing Animation ── */}
            <AnimatePresence>
              {runState === "processing" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-xl border border-primary/20 bg-primary/[0.03] p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    <span className="text-sm font-medium text-primary">{PROCESSING_LABELS[stage]}</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── D. Intelligence Layer ── */}
            <AnimatePresence>
              {runState === "done" && (
                <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
                  <motion.div variants={fadeUp}>
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <h2 className={cn("font-semibold", presenter ? "text-xl" : "text-lg")}>Intelligence</h2>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div variants={fadeUp}>
                      <Card className="h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Globe className="h-4 w-4 text-blue-600" />
                            Website Signal
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-3">
                          <ScoreRing score={websiteScore} />
                          <div className="w-full space-y-1.5">
                            {websiteDimensions.map((d) => (
                              <div key={d.label} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{d.label}</span>
                                <span className={cn("font-medium", d.score >= 70 ? "text-green-600" : d.score >= 50 ? "text-amber-600" : "text-red-600")}>{d.score}</span>
                              </div>
                            ))}
                          </div>
                          <div className="w-full rounded-lg bg-muted/40 px-3 py-2 mt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Listing images</span>
                              <span className={cn("font-medium", hasListingImages ? "text-green-600" : "text-red-600")}>{hasListingImages ? "Present" : "Missing"}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    <motion.div variants={fadeUp}>
                      <Card className="h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Camera className="h-4 w-4 text-amber-600" />
                            Image Diagnosis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={cn("text-[10px]", imageConfidence === "high" ? "bg-green-50 text-green-700 border-green-200" : imageConfidence === "medium" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200")}>
                              Confidence: {imageConfidence}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {imageIssues.map((issue, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs rounded-lg border px-2.5 py-2">
                                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                                <span>{issue}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    <motion.div variants={fadeUp}>
                      <Card className="h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Zap className="h-4 w-4 text-green-600" />
                            Smart Match
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={cn("text-[10px]", smartMatchTriggered ? "bg-green-50 text-green-700 border-green-200" : "bg-muted text-muted-foreground")}>
                              {smartMatchTriggered ? "Triggered" : "Monitor"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{totalMissingUnits} units</span>
                          </div>
                          <div className="space-y-2">
                            {smartMatchCandidates.map((c) => (
                              <div key={c.makeModel} className="rounded-lg border p-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium">{c.makeModel}</span>
                                  <Badge variant="outline" className={cn("text-[9px]", c.priority === "high" ? "border-red-200 text-red-600" : c.priority === "medium" ? "border-amber-200 text-amber-600" : "border-border text-muted-foreground")}>
                                    {c.priority}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">{c.missingUnits} missing</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  <motion.div variants={fadeUp}>
                    <Card className="border-primary/20 bg-primary/[0.02]">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold text-base">Impact Summary</h3>
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] ml-auto">If you execute in 30 days</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="rounded-lg bg-background border p-3">
                            <p className="text-xs text-muted-foreground">Cars at risk</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{carsAtRisk}</p>
                            <p className="text-[10px] text-muted-foreground">per month</p>
                          </div>
                          <div className="rounded-lg bg-background border p-3">
                            <p className="text-xs text-muted-foreground">Monthly exposure</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">${monthlyRisk.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">holding + lead leakage</p>
                          </div>
                          <div className="rounded-lg bg-background border p-3">
                            <p className="text-xs text-muted-foreground">Recoverable</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">${recoverable.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">with 30-day pilot</p>
                          </div>
                          <div className="rounded-lg bg-background border p-3">
                            <p className="text-xs text-muted-foreground">Holding cost</p>
                            <p className="text-2xl font-bold text-foreground mt-1">${holdingCost}</p>
                            <p className="text-[10px] text-muted-foreground">per vehicle / day</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <CardTitle className={presenter ? "text-lg" : "text-base"}>Presentation Output</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <select value={tone} onChange={(e) => setTone(e.target.value as NarrativeTone)} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary">
                              <option value="consultative">Consultative</option>
                              <option value="aggressive">Aggressive</option>
                              <option value="executive">Executive</option>
                            </select>
                            <div className="flex items-center rounded-lg bg-muted p-[3px]">
                              <button onClick={() => setOutputMode("onePager")} className={cn("rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all", outputMode === "onePager" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>
                                <FileText className="h-3.5 w-3.5" />One-pager
                              </button>
                              <button onClick={() => setOutputMode("deck")} className={cn("rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all", outputMode === "deck" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>
                                <Presentation className="h-3.5 w-3.5" />Deck
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {outputMode === "onePager" ? (
                          <div className="space-y-5">
                            <div className="rounded-xl border-l-4 border-l-primary bg-primary/[0.03] p-4">
                              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">Executive Summary</p>
                              <p className={cn("text-foreground leading-relaxed", presenter ? "text-base" : "text-sm")}>{punchline}</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Target className="h-4 w-4 text-red-500" />
                                <h4 className="font-semibold text-sm">Hard-Hitting Openers</h4>
                              </div>
                              <div className="space-y-2">
                                {openers.map((line, i) => (
                                  <div key={i} className="flex items-start gap-2.5 rounded-lg border px-3 py-2.5">
                                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                                    <p className="text-sm">{line}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 rounded-lg border-l-2 border-l-amber-400 bg-amber-50/50 px-3 py-2">
                                <p className="text-xs text-amber-800"><span className="font-medium">What to say:</span> Open with the risk number, pause, then ask: &ldquo;Does that number feel right to you?&rdquo;</p>
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Globe className="h-4 w-4 text-blue-500" />
                                <h4 className="font-semibold text-sm">What They Don&apos;t Know About Themselves</h4>
                              </div>
                              <div className="space-y-2 text-sm">
                                <p>&bull; Only {fullImagePct}% of listings have a complete image set &mdash; the rest are costing buyer attention.</p>
                                <p>&bull; Website quality score ({websiteScore}/100) is below the top-quartile threshold for converting high-intent shoppers.</p>
                                <p>&bull; Image inconsistency across {rooftops} rooftops is creating a fragmented brand experience that buyers notice.</p>
                                {!hasListingImages && <p className="text-red-600 font-medium">&bull; Critical: multiple listings appear to be missing image sets entirely.</p>}
                              </div>
                              <div className="mt-2 rounded-lg border-l-2 border-l-amber-400 bg-amber-50/50 px-3 py-2">
                                <p className="text-xs text-amber-800"><span className="font-medium">What to say:</span> &ldquo;Most dealers we talk to don&apos;t realize how much their website score impacts lead quality before a shopper ever calls.&rdquo;</p>
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="h-4 w-4 text-purple-500" />
                                <h4 className="font-semibold text-sm">What They Don&apos;t Know About Spyne</h4>
                              </div>
                              <div className="space-y-2 text-sm">
                                <p>&bull; Smart Match can automatically identify and fill missing image coverage by make/model using look-alike matching.</p>
                                <p>&bull; Studio AI processes vehicle images in under 60 seconds with consistent background and quality &mdash; no manual editing.</p>
                                <p>&bull; Platform integrates directly with your DMS and listing workflow &mdash; zero disruption to existing processes.</p>
                              </div>
                              <div className="mt-2 rounded-lg border-l-2 border-l-amber-400 bg-amber-50/50 px-3 py-2">
                                <p className="text-xs text-amber-800"><span className="font-medium">What to say:</span> &ldquo;The reason we built Smart Match is exactly for situations like yours &mdash; where coverage is inconsistent and you need a fast path to completeness.&rdquo;</p>
                              </div>
                            </div>
                            <Separator />
                            {smartMatchTriggered && (
                              <>
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Zap className="h-4 w-4 text-green-500" />
                                    <h4 className="font-semibold text-sm">Smart Match Recovery Plan</h4>
                                  </div>
                                  <div className="rounded-lg border overflow-hidden">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b bg-muted/30">
                                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Make / Model</th>
                                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Missing</th>
                                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Priority</th>
                                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground hidden md:table-cell">Action</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {smartMatchCandidates.map((c) => (
                                          <tr key={c.makeModel} className="border-b last:border-b-0">
                                            <td className="px-3 py-2 font-medium">{c.makeModel}</td>
                                            <td className="px-3 py-2">{c.missingUnits} units</td>
                                            <td className="px-3 py-2">
                                              <Badge variant="outline" className={cn("text-[9px]", c.priority === "high" ? "border-red-200 text-red-600" : c.priority === "medium" ? "border-amber-200 text-amber-600" : "border-border text-muted-foreground")}>{c.priority}</Badge>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-muted-foreground hidden md:table-cell">{c.action}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                                <Separator />
                              </>
                            )}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <LinkIcon className="h-4 w-4 text-indigo-500" />
                                <h4 className="font-semibold text-sm">30-Day Pilot Close Plan</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="rounded-lg border p-3 border-l-4 border-l-blue-400">
                                  <p className="text-xs font-semibold text-blue-700">Week 1</p>
                                  <p className="text-xs text-muted-foreground mt-1">Baseline assessment + prioritize model buckets with highest missing coverage.</p>
                                </div>
                                <div className="rounded-lg border p-3 border-l-4 border-l-purple-400">
                                  <p className="text-xs font-semibold text-purple-700">Week 2&ndash;3</p>
                                  <p className="text-xs text-muted-foreground mt-1">Smart Match recovery + process integration + team enablement.</p>
                                </div>
                                <div className="rounded-lg border p-3 border-l-4 border-l-green-400">
                                  <p className="text-xs font-semibold text-green-700">Week 4</p>
                                  <p className="text-xs text-muted-foreground mt-1">Review quality + speed lift, then scale decision across all {rooftops} rooftops.</p>
                                </div>
                              </div>
                              <div className="mt-2 rounded-lg border-l-2 border-l-amber-400 bg-amber-50/50 px-3 py-2">
                                <p className="text-xs text-amber-800"><span className="font-medium">What to say:</span> &ldquo;By end of week 4, you&apos;ll have concrete data on whether this works for your operation. No long commitment &mdash; just proof.&rdquo;</p>
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <ArrowRight className="h-4 w-4 text-primary" />
                                <h4 className="font-semibold text-sm">Recommended Close Actions</h4>
                              </div>
                              <div className="space-y-2">
                                {[
                                  `Confirm ${deep.decisionMaker || "decision maker"} as pilot sponsor`,
                                  "Lock pilot start date: next Monday",
                                  "Share this briefing for internal alignment",
                                  `Address known blocker: "${knownBlocker}"`,
                                ].map((action, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm">
                                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">{i + 1}</div>
                                    <span>{action}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {deckSlides.map((slide, i) => (
                              <div key={i} className={cn("rounded-xl border-l-4 border p-4 hover:shadow-md transition-shadow", slide.accent)}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="flex items-center justify-center h-5 w-5 rounded bg-muted text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                                  <h5 className="text-sm font-semibold">{slide.title}</h5>
                                </div>
                                <div className="space-y-1">
                                  {slide.points.map((pt, j) => (
                                    <p key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                      <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />{pt}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <CardTitle className="text-base">Objection Handling Snippets</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Accordion type="single" collapsible className="w-full">
                          {OBJECTION_SNIPPETS.map((obj, i) => (
                            <AccordionItem key={i} value={`obj-${i}`}>
                              <AccordionTrigger className="hover:no-underline text-sm">&ldquo;{obj.objection}&rdquo;</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  <p className="text-sm text-muted-foreground">{obj.response}</p>
                                  <div className="rounded-lg border-l-2 border-l-primary bg-primary/[0.03] px-3 py-2">
                                    <p className="text-xs"><span className="font-medium text-primary">What to say:</span>{" "}<span className="text-foreground">{obj.whatToSay}</span></p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ════════ RIGHT RAIL ════════ */}
          <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className={cn("h-4 w-4", confidence === "grounded" ? "text-green-600" : confidence === "assumption-aided" ? "text-amber-600" : "text-red-500")} />
                  <span className="text-sm font-medium">Evidence Confidence</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Score</span>
                    <span className={cn("font-medium", confidence === "grounded" ? "text-green-600" : confidence === "assumption-aided" ? "text-amber-600" : "text-red-500")}>{confidenceScore}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div className={cn("h-full rounded-full", confidence === "grounded" ? "bg-green-500" : confidence === "assumption-aided" ? "bg-amber-500" : "bg-red-500")} initial={{ width: 0 }} animate={{ width: `${confidenceScore}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {confidence === "grounded" ? "Strong evidence base \u2014 output is data-backed." : confidence === "assumption-aided" ? "Moderate evidence \u2014 output uses intelligent assumptions." : "Thin evidence \u2014 add context to strengthen output."}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Call Objective</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Stage</span><span className="font-medium">{callStage}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Goal</span><span className="font-medium">{aeGoal}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Blocker</span><span className="font-medium text-right max-w-[180px] truncate">{knownBlocker}</span></div>
                  <Separator className="my-1" />
                  <div className="flex justify-between"><span className="text-muted-foreground">Dealer</span><span className="font-medium text-right max-w-[180px] truncate">{dealerName}</span></div>
                </div>
              </CardContent>
            </Card>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={cn("text-[10px]", confidence === "grounded" ? "border-green-200 text-green-700 bg-green-50" : confidence === "assumption-aided" ? "border-amber-200 text-amber-700 bg-amber-50" : "border-red-200 text-red-700 bg-red-50")}>
                {confidence === "grounded" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                {confidence === "grounded" ? "Grounded" : confidence === "assumption-aided" ? "Assumption" : "Thin"}
              </Badge>
              {smartMatchTriggered && (
                <Badge variant="outline" className="text-[10px] border-purple-200 text-purple-700 bg-purple-50"><Zap className="h-3 w-3 mr-1" />Smart Match ON</Badge>
              )}
              {deepFilledCount > 0 && (
                <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-700 bg-blue-50"><Layers className="h-3 w-3 mr-1" />Deep: {deepFilledCount}</Badge>
              )}
            </div>
            <AnimatePresence>
              {runState === "done" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <LinkIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Share Briefing</span>
                      </div>
                      <div className="rounded-lg border bg-muted/30 px-3 py-2 font-mono text-xs break-all mb-3">{shareLink}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={copyLink} className="flex-1 text-xs h-8">
                          {copied ? <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-600" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                          {copied ? "Copied!" : "Copy link"}
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs h-8">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />Open
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── Mobile Sticky CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden border-t bg-background/95 backdrop-blur-sm p-4 z-50">
        {runState === "idle" ? (
          <Button
            disabled={!setupReady}
            onClick={runAnalysis}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Briefing
          </Button>
        ) : runState === "processing" ? (
          <Button disabled className="w-full h-11">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {PROCESSING_LABELS[stage]}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={refineAnalysis}
              variant="outline"
              className="flex-1 h-11"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refine
            </Button>
            <Button
              onClick={copyLink}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-11"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied!" : "Share"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
