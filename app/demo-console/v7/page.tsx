"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  ImageOff,
  Layers,
  Loader2,
  MessageSquare,
  Palette,
  Play,
  RotateCcw,
  Send,
  Share2,
  Shield,
  Sparkles,
  Sun,
  Target,
  Settings2,
  Stamp,
  CreditCard,
  Award,
  QrCode,
  Type,
  Video,
  Wand2,
  X,
  Zap,
} from "lucide-react"

/* ══════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════ */

type Phase = "setup" | "inventory" | "fix" | "golive" | "impact"
type ViewMode = "table" | "website"
type CarCategory = "lot-photos" | "vin-cloned" | "no-photos" | "ready"

interface FormData {
  dealerName: string
  dealerUrl: string
  rooftops: string
  monthlyCars: string
  avgDaysOnLot: string
  holdingCostPerDay: string
  fullImageSetPct: string
  photoWorkflow: string
}

interface CarIssue {
  label: string
  detail: string
  severity: "high" | "medium" | "low"
  fixLabel: string
}

interface InventoryCar {
  id: string
  stockNo: string
  year: number
  make: string
  model: string
  trim: string
  color: string
  vin: string
  daysOnLot: number
  price: number
  lotPhotos: string[]
  vinClonedPhotos: string[]
  spynePhotos: string[]
  smartMatchPhotos: string[]
  issues: CarIssue[]
  hasVinCloned: boolean
  status: "needs-review" | "in-progress" | "ready"
  holdingCostPerDay: number
  category: CarCategory
}

/* ══════════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════════ */

const STEPS: Array<{ key: Phase; label: string; sub: string }> = [
  { key: "inventory", label: "Inventory", sub: "Your active listings" },
  { key: "fix", label: "Transform", sub: "See the difference" },
  { key: "golive", label: "Go Live", sub: "Publish everywhere" },
  { key: "impact", label: "Impact", sub: "ROI & next steps" },
]

const RAW = (n: number) => `/demo-console/raw/raw-${String(n).padStart(2, "0")}.png`
const PROC = (n: number) => `/demo-console/processed/processed-${String(n).padStart(2, "0")}.png`

/* ── Vehicle data pools ── */

const VEHICLE_POOL = [
  { make: "Toyota", model: "Camry", trims: ["LE", "SE", "XLE", "TRD"], type: "sedan" },
  { make: "Toyota", model: "RAV4", trims: ["LE", "XLE", "Adventure", "TRD"], type: "suv" },
  { make: "Honda", model: "CR-V", trims: ["LX", "EX", "EX-L", "Touring"], type: "suv" },
  { make: "Honda", model: "Civic", trims: ["LX", "Sport", "EX", "Touring"], type: "sedan" },
  { make: "Ford", model: "F-150", trims: ["XL", "XLT", "Lariat", "King Ranch"], type: "truck" },
  { make: "Ford", model: "Explorer", trims: ["Base", "XLT", "Limited", "ST"], type: "suv" },
  { make: "Chevrolet", model: "Equinox", trims: ["LS", "LT", "RS", "Premier"], type: "suv" },
  { make: "Chevrolet", model: "Silverado", trims: ["WT", "Custom", "LT", "RST"], type: "truck" },
  { make: "BMW", model: "X3", trims: ["sDrive30i", "xDrive30i", "M40i"], type: "luxury" },
  { make: "BMW", model: "3 Series", trims: ["330i", "330e", "M340i"], type: "luxury" },
  { make: "Hyundai", model: "Tucson", trims: ["SE", "SEL", "N Line", "Limited"], type: "suv" },
  { make: "Hyundai", model: "Elantra", trims: ["SE", "SEL", "N Line", "Limited"], type: "sedan" },
  { make: "Kia", model: "Sportage", trims: ["LX", "EX", "SX", "X-Pro"], type: "suv" },
  { make: "Kia", model: "Forte", trims: ["FE", "LXS", "GT-Line", "GT"], type: "sedan" },
  { make: "Nissan", model: "Rogue", trims: ["S", "SV", "SL", "Platinum"], type: "suv" },
  { make: "Mazda", model: "CX-5", trims: ["S", "Select", "Preferred", "Turbo"], type: "suv" },
  { make: "Jeep", model: "Grand Cherokee", trims: ["Laredo", "Limited", "Overland"], type: "suv" },
  { make: "Subaru", model: "Outback", trims: ["Base", "Premium", "Limited", "Touring"], type: "suv" },
  { make: "Volkswagen", model: "Tiguan", trims: ["S", "SE", "SEL", "SEL R-Line"], type: "suv" },
  { make: "Skoda", model: "Kamiq", trims: ["Active", "Ambition", "Style", "Monte Carlo"], type: "suv" },
  { make: "Mercedes-Benz", model: "GLC", trims: ["GLC 300", "GLC 300 4M", "AMG GLC 43"], type: "luxury" },
  { make: "Audi", model: "Q5", trims: ["Premium", "Premium Plus", "Prestige"], type: "luxury" },
  { make: "Dodge", model: "Charger", trims: ["SXT", "GT", "R/T", "Scat Pack"], type: "sedan" },
  { make: "Ram", model: "1500", trims: ["Tradesman", "Big Horn", "Laramie", "Limited"], type: "truck" },
  { make: "Nissan", model: "Altima", trims: ["S", "SV", "SL", "SR"], type: "sedan" },
] as const

const COLORS = [
  "Midnight Black", "Oxford White", "Lunar Silver", "Quartz Grey", "Deep Blue Pearl",
  "Crystal Red", "Phantom Black", "Glacier White", "Gunmetal Grey", "Desert Sand",
  "Pacific Blue", "Crimson Red", "Sterling Grey", "Arctic White", "Obsidian Black",
  "Titanium Silver", "Sapphire Blue", "Ruby Red", "Pearl White", "Carbon Grey",
]

const VIN_PREFIXES = [
  "1HGCV", "2T1BU", "3GNAX", "5UXCR", "1FTFW", "KMHD8", "KNMAT",
  "5NMS3", "JN8AT", "JM3KF", "1C4RJ", "4S4BT", "3VV3B", "TMBJJ",
]

const TRANSFORM_LABELS = [
  "Analyzing inventory images…",
  "Removing distracting backgrounds…",
  "Correcting bad angles…",
  "Removing watermarks and banners…",
  "Replacing VIN-cloned images…",
  "Running Smart Match for missing photos…",
  "Optimizing for marketplace standards…",
  "Applying dealer branding…",
  "Finalizing all vehicles…",
]

const FIXES = [
  { icon: Layers, label: "Clean background" },
  { icon: Sun, label: "Fixed lighting" },
  { icon: RotateCcw, label: "Straightened" },
  { icon: Palette, label: "Consistent color" },
  { icon: Eye, label: "Added reflections" },
  { icon: Shield, label: "Plate hidden" },
]

const PHOTO_WORKFLOWS = ["in-house", "agency", "mixed", "unknown"]

const PUBLISH_CHANNELS = [
  { id: "website", label: "Your Website", desc: "Direct dealer site", icon: Globe },
  { id: "autotrader", label: "AutoTrader", desc: "High-intent buyers", icon: Target, comingSoon: true },
  { id: "cargurus", label: "CarGurus", desc: "Deal rating platform", icon: BarChart3, comingSoon: true },
  { id: "carscom", label: "Cars.com", desc: "Largest marketplace", icon: Layers, comingSoon: true },
  { id: "facebook", label: "Facebook", desc: "Social marketplace", icon: Share2, comingSoon: true },
  { id: "google", label: "Google VLA", desc: "Vehicle listing ads", icon: Globe, comingSoon: true },
]

const CAMPAIGN_TYPES = ["Price Drop", "New Arrival", "CPO Certified", "Clearance"]

const OBJECTION_SNIPPETS = [
  {
    objection: "We already have a photographer",
    response: "Spyne doesn't replace your photographer — it accelerates their output, ensures consistency across locations, and fills gaps when they can't cover every vehicle.",
    whatToSay: "How many vehicles does your photographer cover per day? We typically help teams 3x that throughput without changing workflow.",
  },
  {
    objection: "Budget is locked this quarter",
    response: "The ROI on listing-ready time alone typically pays for Spyne within the first month. Every day a vehicle sits without proper photos costs $40-50 in holding costs.",
    whatToSay: "What if I could show you how Spyne pays for itself in 30 days based on your current holding costs?",
  },
  {
    objection: "We tried AI photo tools before",
    response: "Most tools do one thing — background removal or enhancement. Spyne is the only platform that handles the entire merchandising pipeline: shoot, edit, publish, and optimize.",
    whatToSay: "Which tool did you use? I'd love to show you the specific gaps Spyne fills that others can't.",
  },
  {
    objection: "Our images look fine",
    response: "Fine doesn't win the click. In marketplace rankings, listing quality directly affects visibility. The jump from 'fine' to 'great' is the difference between page 1 and page 3.",
    whatToSay: "Let me run a quick quality score on your top 10 listings — I think you'll be surprised at what the data shows.",
  },
]

/* ── Map each raw image to the issue it visually represents ── */

const RAW_ISSUE_MAP: Record<number, CarIssue> = {
  2:  { label: "Low quality images",       detail: "Resolution below marketplace minimum standards",      severity: "high",   fixLabel: "Enhanced to HD quality" },
  3:  { label: "Distracting background",   detail: "Parking lot clutter visible behind vehicle",          severity: "high",   fixLabel: "Background replaced with studio finish" },
  4:  { label: "Inconsistent framing",     detail: "Photos cropped differently across angles",            severity: "medium", fixLabel: "Standardized to consistent composition" },
  5:  { label: "Cut-off images",           detail: "Vehicle partially cropped at frame edges",            severity: "high",   fixLabel: "Reframed with full vehicle visible" },
  6:  { label: "Seasonality",              detail: "Weather/season doesn't match current listing period", severity: "medium", fixLabel: "Background adjusted to current season" },
  7:  { label: "Bad angles",               detail: "Unflattering perspective reduces buyer interest",     severity: "high",   fixLabel: "Angle corrected from similar vehicle" },
  8:  { label: "Watermarks",               detail: "Third-party watermarks visible on images",            severity: "medium", fixLabel: "Watermarks removed cleanly" },
  9:  { label: "Unsightly dealer banners", detail: "Promotional overlays blocking vehicle view",          severity: "high",   fixLabel: "Banners removed, vehicle fully visible" },
  10: { label: "Lack of branding",         detail: "No dealer identity on listing images",                severity: "low",    fixLabel: "Dealer branding applied consistently" },
}

function issueForRaw(src: string): CarIssue | null {
  const m = src.match(/raw-(\d+)/)
  if (!m) return null
  return RAW_ISSUE_MAP[parseInt(m[1])] ?? null
}

/* ══════════════════════════════════════════════════════════════════
   INVENTORY GENERATOR
   ══════════════════════════════════════════════════════════════════ */

function buildInventory(form: FormData): InventoryCar[] {
  const holdingCost = Number(form.holdingCostPerDay) || 45
  const cars: InventoryCar[] = []

  for (let i = 0; i < 50; i++) {
    let cat: CarCategory
    if (i < 3) cat = "ready"
    else if (i < 10) cat = "no-photos"
    else if (i < 20) cat = "vin-cloned"
    else cat = "lot-photos"

    const mm = VEHICLE_POOL[i % VEHICLE_POOL.length]
    const trim = mm.trims[(i * 3) % mm.trims.length]
    const color = COLORS[(i * 7) % COLORS.length]
    const year = 2022 + (i % 3)

    const letter = String.fromCharCode(65 + (i % 26))
    const stockNo = `${letter}${String(1000 + ((i * 37) % 9000)).padStart(4, "0")}`

    const vinPrefix = VIN_PREFIXES[i % VIN_PREFIXES.length]
    const vin = `${vinPrefix}•••${String(1000 + ((i * 73) % 9000)).padStart(4, "0")}`

    const daysOnLot = cat === "ready" ? 1 + (i % 3) : 2 + ((i * 5) % 18)
    const basePrice = mm.type === "truck" ? 35000 : mm.type === "luxury" ? 40000 : mm.type === "suv" ? 29000 : 24000
    const price = basePrice + ((i * 731) % 15000)

    const rawCount = cat === "lot-photos" ? 3 + (i % 3) : cat === "vin-cloned" ? 2 + (i % 2) : 0
    const lotPhotos = Array.from({ length: rawCount }, (_, j) => RAW(((i * 3 + j) % 9) + 2))

    const vcCount = cat === "vin-cloned" ? 2 + (i % 2) : 0
    const vinClonedPhotos = Array.from({ length: vcCount }, (_, j) => RAW(((i * 7 + j + 5) % 9) + 2))

    let issues: CarIssue[]
    if (cat === "ready") {
      issues = []
    } else if (cat === "no-photos") {
      issues = [{ label: "No photos on file", detail: "Vehicle has zero images — invisible to online buyers", severity: "high", fixLabel: "Images added via Smart Match" }]
    } else {
      const seen = new Set<string>()
      issues = lotPhotos.map(src => issueForRaw(src)).filter((x): x is CarIssue => {
        if (!x || seen.has(x.label)) return false
        seen.add(x.label)
        return true
      })
      if (cat === "vin-cloned") {
        issues.unshift({ label: "VIN-cloned images in use", detail: "Stock photos from a different vehicle — creates buyer mistrust", severity: "high", fixLabel: "Replaced with actual vehicle photos" })
      }
    }

    const spCount = cat === "ready" ? 4 + (i % 3) : cat !== "no-photos" ? 2 + (i % 3) : 0
    const spynePhotos = Array.from({ length: spCount }, (_, j) => PROC(((i * 2 + j) % 8) + 1))

    const smCount = cat === "no-photos" ? 3 + (i % 2) : 0
    const smartMatchPhotos = Array.from({ length: smCount }, (_, j) => PROC(((i * 5 + j) % 8) + 1))

    cars.push({
      id: `inv-${i}`,
      stockNo, year,
      make: mm.make, model: mm.model, trim, color,
      vin, daysOnLot, price,
      lotPhotos, vinClonedPhotos, spynePhotos, smartMatchPhotos,
      issues, hasVinCloned: cat === "vin-cloned",
      status: cat === "ready" ? "ready" : "needs-review",
      holdingCostPerDay: holdingCost,
      category: cat,
    })
  }
  return cars
}

function qualityScore(issues: CarIssue[]): number {
  let s = 92
  for (const issue of issues) {
    if (issue.severity === "high") s -= 14
    else if (issue.severity === "medium") s -= 8
    else s -= 4
  }
  return Math.max(18, s)
}

/* ══════════════════════════════════════════════════════════════════
   SCORE RING
   ══════════════════════════════════════════════════════════════════ */

function ScoreRing({ value, size = 56, stroke = 5, color = "text-purple-500" }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-gray-200" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className={color}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <span className="absolute text-xs font-bold text-gray-900">{value}</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export default function DemoConsoleV7Page() {
  /* ── Form ── */
  const [formData, setFormData] = useState<FormData>({
    dealerName: "Desert Valley Auto Group",
    dealerUrl: "https://desertvalley.example.com",
    rooftops: "8",
    monthlyCars: "420",
    avgDaysOnLot: "42",
    holdingCostPerDay: "45",
    fullImageSetPct: "58",
    photoWorkflow: "mixed",
  })
  function updateForm(key: keyof FormData, v: string) { setFormData((p) => ({ ...p, [key]: v })) }

  /* ── Core state ── */
  const [phase, setPhase] = useState<Phase>("setup")
  const [inventory, setInventory] = useState<InventoryCar[]>([])
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("table")

  /* ── Transform ── */
  const [transformed, setTransformed] = useState(false)
  const [transformedIds, setTransformedIds] = useState<Set<string>>(new Set())
  const [transforming, setTransforming] = useState(false)
  const [transformTarget, setTransformTarget] = useState<"all" | string | null>(null)
  const [transformProgress, setTransformProgress] = useState(0)
  const [transformLabelIdx, setTransformLabelIdx] = useState(0)

  /* ── Settings ── */
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<"studio" | "mediakit">("studio")
  const [selectedBg, setSelectedBg] = useState(0)
  const [numberplateMasking, setNumberplateMasking] = useState(false)
  const [selectedVideoTemplate, setSelectedVideoTemplate] = useState(0)
  const [activeProducts, setActiveProducts] = useState<Set<string>>(new Set(["images", "360spin", "videotour"]))
  const [activeMediaKitAssets, setActiveMediaKitAssets] = useState<Set<string>>(new Set(["watermark", "tagline"]))

  /* ── Go Live + Impact ── */
  const [publishChannels, setPublishChannels] = useState<Set<string>>(new Set(["website", "autotrader", "cargurus"]))
  const [campaignType, setCampaignType] = useState("New Arrival")
  const [openObjection, setOpenObjection] = useState<number | null>(null)

  /* ── Phase-specific animation ── */
  const [problemStep, setProblemStep] = useState(0)
  const [fixStep, setFixStep] = useState(0)
  const [dividerPos, setDividerPos] = useState(65)
  const [currentPair, setCurrentPair] = useState(0)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  /* ── Derived ── */
  const selectedCar = useMemo(() => inventory.find((c) => c.id === selectedCarId) ?? null, [inventory, selectedCarId])
  const phaseIndex = STEPS.findIndex((s) => s.key === phase)

  const activeLotPhotos = selectedCar?.lotPhotos.length ? selectedCar.lotPhotos : [RAW(1), RAW(2), RAW(3), RAW(4)]
  const activeProcessed = selectedCar?.spynePhotos.length
    ? selectedCar.spynePhotos
    : selectedCar?.smartMatchPhotos.length
      ? selectedCar.smartMatchPhotos
      : [PROC(1), PROC(2), PROC(3), PROC(4)]
  const activeIssues = selectedCar?.issues ?? []
  const pairCount = Math.min(activeLotPhotos.length, activeProcessed.length)
  const carLabel = selectedCar ? `${selectedCar.year} ${selectedCar.make} ${selectedCar.model}` : "this car"
  const score = qualityScore(activeIssues)

  const totalIssues = useMemo(() => inventory.reduce((s, c) => s + c.issues.length, 0), [inventory])
  const vinClonedCount = useMemo(() => inventory.filter((c) => c.hasVinCloned).length, [inventory])
  const noPhotosCount = useMemo(() => inventory.filter((c) => c.category === "no-photos").length, [inventory])
  const dailyHoldingCost = useMemo(() => inventory.reduce((s, c) => s + c.holdingCostPerDay, 0), [inventory])

  const monthlyCars = Number(formData.monthlyCars) || 420
  const hcPerDay = Number(formData.holdingCostPerDay) || 45
  const fullPct = Number(formData.fullImageSetPct) || 58
  const rooftopCount = Number(formData.rooftops) || 1
  const carsAtRisk = Math.round(monthlyCars * (fullPct < 60 ? 0.38 : fullPct < 72 ? 0.28 : 0.18))
  const recoverable = Math.round(carsAtRisk * hcPerDay * 2 * 0.32)
  const monthlyExposure = carsAtRisk * hcPerDay * 2

  /* ── Intelligence (impact page) ── */
  const websiteScore = useMemo(() => {
    const base = fullPct >= 72 ? 78 : fullPct >= 55 ? 57 : 34
    const photoBoost = fullPct > 70 ? 8 : fullPct > 50 ? 4 : -5
    const rooftopPenalty = rooftopCount > 10 ? -4 : rooftopCount > 5 ? -2 : 0
    return Math.max(25, Math.min(95, base + photoBoost + rooftopPenalty))
  }, [fullPct, rooftopCount])

  const websiteDimensions = useMemo(() => [
    { label: "Listing image coverage", score: fullPct >= 72 ? 85 : fullPct >= 55 ? 58 : 28 },
    { label: "Website consistency", score: Math.min(90, websiteScore + 8) },
    { label: "CTA clarity", score: Math.min(88, websiteScore + 5) },
    { label: "Mobile readiness", score: Math.min(92, websiteScore + 12) },
    { label: "Trust signals", score: Math.max(30, websiteScore - 6) },
  ], [websiteScore, fullPct])

  const imageConfidence = useMemo(() => {
    if (inventory.length >= 20) return "high"
    if (inventory.length >= 8) return "medium"
    return "assumption-aided"
  }, [inventory.length])

  const imageIssues = useMemo(() => {
    const issues: string[] = []
    if (inventory.length < 15) issues.push("Low sample volume — evidence confidence is medium (assumption-aided).")
    if (noPhotosCount > 0) issues.push("Critical: multiple listings missing image sets entirely.")
    if (fullPct < 60) issues.push("Angle coverage inconsistency — exterior and focus shots incomplete.")
    issues.push("Mixed quality due to distributed capture process across locations.")
    if (fullPct < 70) issues.push("Likely blur / framing defects creating downstream rework.")
    return issues
  }, [inventory.length, noPhotosCount, fullPct])

  const smartMatchTriggered = fullPct < 72 || noPhotosCount > 0

  const smartMatchCandidates = useMemo(() => {
    const m = rooftopCount > 6 ? 1.2 : 1
    return [
      { makeModel: "Toyota Camry", missingUnits: Math.max(4, Math.round(10 * m)), priority: "high" as const },
      { makeModel: "Honda Civic", missingUnits: Math.max(3, Math.round(8 * m)), priority: "medium" as const },
      { makeModel: "Hyundai Tucson", missingUnits: Math.max(2, Math.round(5 * m)), priority: "low" as const },
      { makeModel: "Ford F-150", missingUnits: Math.max(3, Math.round(7 * m)), priority: "high" as const },
    ]
  }, [rooftopCount])

  const totalMissingUnits = smartMatchCandidates.reduce((a, c) => a + c.missingUnits, 0)

  /* ── Effects ── */
  useEffect(() => {
    if (phase === "fix" && selectedCarId && activeIssues.length > 0) {
      setProblemStep(0)
      const timers = activeIssues.map((_, i) => setTimeout(() => setProblemStep(i + 1), 400 + i * 350))
      return () => timers.forEach(clearTimeout)
    }
  }, [phase, selectedCarId, activeIssues])

  useEffect(() => {
    if (phase === "fix") {
      setFixStep(0)
      const timers = FIXES.map((_, i) => setTimeout(() => setFixStep(i + 1), 500 + i * 350))
      return () => timers.forEach(clearTimeout)
    }
  }, [phase])

  useEffect(() => {
    if (!transforming || !transformTarget) return
    let step = 0
    const total = transformTarget === "all" ? 60 : 30
    const timer = setInterval(() => {
      step++
      setTransformProgress((step / total) * 100)
      setTransformLabelIdx(Math.min(TRANSFORM_LABELS.length - 1, Math.floor((step / total) * TRANSFORM_LABELS.length)))
      if (step >= total) {
        clearInterval(timer)
        setTimeout(() => {
          setTransforming(false)
          if (transformTarget === "all") {
            setTransformed(true)
          } else {
            setTransformedIds((prev) => new Set(prev).add(transformTarget))
          }
          setTransformTarget(null)
        }, 300)
      }
    }, 50)
    return () => clearInterval(timer)
  }, [transforming, transformTarget])

  /* ── Navigation ── */
  function goTo(target: Phase) {
    if (target !== "inventory" && target !== "setup" && !selectedCarId) {
      const first = inventory.find((c) => c.status !== "ready")
      if (first) setSelectedCarId(first.id)
    }
    setPhase(target)
    setDividerPos(65)
    setCurrentPair(0)
  }
  function next() { if (phaseIndex < STEPS.length - 1) goTo(STEPS[phaseIndex + 1].key) }

  function handleSetup() {
    const inv = buildInventory(formData)
    setInventory(inv)
    setPhase("inventory")
  }

  function isCarDone(car: InventoryCar): boolean {
    return transformed || transformedIds.has(car.id) || car.status === "ready"
  }

  function startTransform() {
    setTransformTarget("all")
    setTransforming(true)
    setTransformProgress(0)
    setTransformLabelIdx(0)
  }

  function startSingleTransform(carId: string) {
    setTransformTarget(carId)
    setTransforming(true)
    setTransformProgress(0)
    setTransformLabelIdx(0)
  }

  const selectedCarDone = selectedCar ? isCarDone(selectedCar) : false
  const isTransformingSelected = transforming && transformTarget !== null && transformTarget !== "all" && transformTarget === selectedCarId

  function getThumb(car: InventoryCar): string {
    if (isCarDone(car)) return car.spynePhotos[0] || car.smartMatchPhotos[0] || PROC(1)
    return car.lotPhotos[0] || car.vinClonedPhotos[0] || car.smartMatchPhotos[0] || car.spynePhotos[0] || ""
  }

  /* ── Slider handlers ── */
  const handleMouseDown = useCallback(() => { isDragging.current = true }, [])
  const handleMouseUp = useCallback(() => { isDragging.current = false }, [])
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setDividerPos(Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100)))
  }, [])
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setDividerPos(Math.max(5, Math.min(95, ((e.touches[0].clientX - rect.left) / rect.width) * 100)))
  }, [])

  /* ══════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ──────────── SETUP SCREEN ──────────── */}
      {phase === "setup" && (
        <div className="flex items-center justify-center min-h-screen px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-[#6C47FF]" />
                <span className="text-gray-900 font-bold text-xl">spyne</span>
              </div>
              <h1 className="text-3xl font-bold">Start your demo</h1>
              <p className="text-gray-500 mt-2">Tell us about the dealership to personalize the experience</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1.5 text-sm md:col-span-2">
                  <span className="text-gray-500">Dealer / Group name</span>
                  <input value={formData.dealerName} onChange={(e) => updateForm("dealerName", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-gray-900 placeholder:text-gray-300" />
                </label>
                <label className="space-y-1.5 text-sm md:col-span-2">
                  <span className="text-gray-500">Dealership URL</span>
                  <input value={formData.dealerUrl} onChange={(e) => updateForm("dealerUrl", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-gray-900 placeholder:text-gray-300" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-gray-500">Rooftop count</span>
                  <input value={formData.rooftops} onChange={(e) => updateForm("rooftops", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-gray-900" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-gray-500">Monthly cars listed</span>
                  <input value={formData.monthlyCars} onChange={(e) => updateForm("monthlyCars", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-gray-900" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-gray-500">Avg days on lot</span>
                  <input value={formData.avgDaysOnLot} onChange={(e) => updateForm("avgDaysOnLot", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-gray-900" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-gray-500">Holding cost / day ($)</span>
                  <input value={formData.holdingCostPerDay} onChange={(e) => updateForm("holdingCostPerDay", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-gray-900" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-gray-500">% listings with full image set</span>
                  <input value={formData.fullImageSetPct} onChange={(e) => updateForm("fullImageSetPct", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-gray-900" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-gray-500">Photo workflow</span>
                  <select value={formData.photoWorkflow} onChange={(e) => updateForm("photoWorkflow", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-gray-900">
                    {PHOTO_WORKFLOWS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </label>
              </div>
            </div>

            <button onClick={handleSetup}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-4 text-lg font-semibold text-white transition-colors flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" /> Start Demo
            </button>
          </motion.div>
        </div>
      )}

      {/* ──────────── MAIN FLOW (post-setup) ──────────── */}
      {phase !== "setup" && (
        <>
          {/* HEADER */}
          <div className="border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-widest text-purple-400 mb-1">{formData.dealerName}</p>
                  <h1 className="text-4xl font-bold tracking-tight leading-tight">
                    From lot photo to live listing.<br />
                    <span className="text-purple-400">Under 2 seconds.</span>
                  </h1>
                  <p className="text-gray-500 mt-2 text-lg">No photographer. No editor. No waiting.</p>
                </div>
                {!transformed && inventory.length > 0 && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1">
                    <DollarSign className="h-3.5 w-3.5 text-red-500" />
                    <div className="flex flex-col items-start">
                      <span className="text-[9px] text-red-500 leading-none">Burning right now</span>
                      <span className="text-sm font-bold text-red-600">${dailyHoldingCost.toLocaleString()}/day</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEPPER */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-3">
              <div className="flex items-center gap-1">
                {STEPS.map((step, i) => {
                  const isActive = phase === step.key
                  const isPast = phaseIndex > i
                  return (
                    <div key={step.key} className="flex items-center flex-1 min-w-0">
                      <button
                        onClick={() => { goTo(step.key); if (step.key === "inventory") setSelectedCarId(null) }}
                        className={cn(
                          "flex-1 flex items-center gap-3 rounded-xl px-4 py-3 transition-all",
                          isActive && "bg-purple-500/20 ring-1 ring-purple-500/40",
                          isPast && !isActive && "opacity-60 hover:opacity-80",
                          !isPast && !isActive && "opacity-30",
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                          isActive ? "bg-purple-500 text-white" : isPast ? "bg-green-500/80 text-white" : "bg-gray-200 text-gray-400",
                        )}>
                          {isPast ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-sm font-semibold truncate">{step.label}</p>
                          <p className="text-xs text-gray-400 truncate">{step.sub}</p>
                        </div>
                      </button>
                      {i < STEPS.length - 1 && (
                        <div className={cn("w-6 flex justify-center shrink-0", isPast ? "text-green-500" : "text-gray-200")}>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            <AnimatePresence mode="wait">

              {/* ═══════════════════════════════════════════════
                 1. INVENTORY — no car selected
                 ═══════════════════════════════════════════════ */}
              {phase === "inventory" && (
                <motion.div key="inv-list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* View mode toggle */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                      <button onClick={() => setViewMode("table")}
                        className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-all", viewMode === "table" ? "bg-purple-500 text-white" : "text-gray-500 hover:text-gray-600")}>
                        Inventory View
                      </button>
                      <button onClick={() => setViewMode("website")}
                        className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-all", viewMode === "website" ? "bg-purple-500 text-white" : "text-gray-500 hover:text-gray-600")}>
                        <Globe className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />Website View
                      </button>
                    </div>
                    {transformed && (
                      <Badge className="bg-green-500/20 text-green-600 border-green-500/30">All Vehicles Transformed</Badge>
                    )}
                  </div>

                  {/* Summary cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm text-gray-400">Active Listings</p>
                      <p className="text-3xl font-bold mt-1">{inventory.length}</p>
                    </div>
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <p className="text-sm text-amber-600/60">Total Issues</p>
                      <p className="text-3xl font-bold text-amber-600 mt-1">{transformed ? 0 : inventory.reduce((s, c) => s + (isCarDone(c) ? 0 : c.issues.length), 0)}</p>
                      {transformed && <p className="text-xs text-green-400 mt-1">All fixed</p>}
                    </div>
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                      <p className="text-sm text-red-600/60">VIN Cloned</p>
                      <p className="text-3xl font-bold text-red-600 mt-1">{transformed ? 0 : inventory.filter((c) => c.hasVinCloned && !isCarDone(c)).length}</p>
                      {transformed && <p className="text-xs text-green-400 mt-1">All replaced</p>}
                    </div>
                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                      <p className="text-sm text-purple-600/60">No Photos</p>
                      <p className="text-3xl font-bold text-purple-600 mt-1">{transformed ? 0 : inventory.filter((c) => c.category === "no-photos" && !isCarDone(c)).length}</p>
                      {transformed && <p className="text-xs text-green-400 mt-1">Smart Matched</p>}
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center gap-3">
                      <ScoreRing value={transformed ? 94 : Math.round(inventory.reduce((s, c) => s + qualityScore(isCarDone(c) ? [] : c.issues), 0) / Math.max(1, inventory.length))} size={48} stroke={4} color={transformed ? "text-green-500" : "text-amber-500"} />
                      <div>
                        <p className="text-sm text-gray-400">Avg Quality</p>
                        <p className="text-xs text-gray-500 mt-0.5">{transformed ? "Excellent" : "Needs work"}</p>
                      </div>
                    </div>
                  </div>

                  {/* ── TABLE VIEW ── */}
                  {viewMode === "table" && (
                    <div className="rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 z-10">
                            <tr className="border-b border-gray-200 bg-gray-100">
                              <th className="text-left px-4 py-3 text-gray-400 font-medium">Stock&nbsp;#</th>
                              <th className="text-left px-4 py-3 text-gray-400 font-medium">Vehicle</th>
                              <th className="text-left px-4 py-3 text-gray-400 font-medium">Photos</th>
                              <th className="text-left px-4 py-3 text-gray-400 font-medium">Issues</th>
                              <th className="text-left px-4 py-3 text-gray-400 font-medium">VIN&nbsp;Cloned</th>
                              <th className="text-left px-4 py-3 text-gray-400 font-medium">Days</th>
                              <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inventory.map((car, idx) => {
                              const thumb = getThumb(car)
                              const photoCount = car.lotPhotos.length + car.vinClonedPhotos.length
                              const noPhotos = car.category === "no-photos"
                              return (
                                <tr
                                  key={car.id}
                                  onClick={() => { setSelectedCarId(car.id); setPhase("fix"); setDividerPos(65); setCurrentPair(0) }}
                                  className={cn(
                                    "border-b border-gray-100 cursor-pointer transition-colors hover:bg-purple-500/10",
                                    !isCarDone(car) && car.hasVinCloned && "bg-red-500/[0.03]",
                                    !isCarDone(car) && noPhotos && "bg-purple-500/[0.03]",
                                    isCarDone(car) && "bg-green-500/[0.02]",
                                  )}
                                >
                                  <td className="px-4 py-3 font-mono text-gray-500 text-xs">{car.stockNo}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                        <Image src={thumb && !noPhotos ? thumb : RAW(1)} alt={car.model} fill className="object-cover" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{car.year} {car.make} {car.model}</p>
                                        <p className="text-xs text-gray-400">{car.trim} · {car.color}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    {isCarDone(car) ? (
                                      <div className="flex items-center gap-1.5">
                                        <Camera className="h-3.5 w-3.5 text-green-400" />
                                        <span className="text-green-600 text-xs">{(car.spynePhotos.length || car.smartMatchPhotos.length)}</span>
                                      </div>
                                    ) : noPhotos ? (
                                      <div className="flex items-center gap-1.5">
                                        <ImageOff className="h-3.5 w-3.5 text-purple-400" />
                                        <span className="text-purple-600 text-xs font-medium">None</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        <Camera className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500">{photoCount}</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {isCarDone(car) ? (
                                      <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">Fixed</Badge>
                                    ) : car.issues.length > 0 ? (
                                      <div className="space-y-1.5">
                                        <Badge className={cn("text-xs", car.issues.some((is) => is.severity === "high") ? "bg-red-500/20 text-red-600 border-red-500/30" : "bg-amber-500/20 text-amber-600 border-amber-500/30")}>
                                          {car.issues.length} issue{car.issues.length !== 1 && "s"}
                                        </Badge>
                                        <div className="flex flex-wrap gap-1">
                                          {car.issues.map((issue, ii) => (
                                            <span key={ii} className={cn(
                                              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] leading-tight font-medium",
                                              issue.severity === "high"
                                                ? "bg-red-500/10 text-red-600"
                                                : issue.severity === "medium"
                                                  ? "bg-amber-500/10 text-amber-600"
                                                  : "bg-gray-100 text-gray-500"
                                            )}>
                                              <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                                              {issue.label}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">Clean</Badge>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {isCarDone(car) ? (
                                      <span className="text-green-600 text-xs">—</span>
                                    ) : car.hasVinCloned ? (
                                      <div className="flex items-center gap-1.5">
                                        <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                                        <span className="text-red-600 text-xs font-medium">Yes</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-300 text-xs">—</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={cn("font-medium", car.daysOnLot >= 10 ? "text-red-600" : car.daysOnLot >= 5 ? "text-amber-600" : "text-gray-500")}>
                                      {car.daysOnLot}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge className={cn("text-xs", isCarDone(car) ? "bg-green-500/20 text-green-600 border-green-500/30" : "bg-gray-200 text-gray-500 border-gray-200")}>
                                      {isCarDone(car) ? "Ready" : "Needs Review"}
                                    </Badge>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ── WEBSITE SRP VIEW ── */}
                  {viewMode === "website" && (
                    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                      {/* Browser chrome */}
                      <div className="border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 bg-gray-50">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-400" />
                          <div className="w-3 h-3 rounded-full bg-yellow-400" />
                          <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="flex-1 bg-white rounded-lg px-3 py-1.5 text-sm text-gray-400 font-mono truncate border">
                          {formData.dealerUrl}/inventory
                        </div>
                      </div>

                      {/* Dealership website */}
                      <div className="bg-white max-h-[750px] overflow-y-auto text-gray-900">
                        {/* Top strip */}
                        <div className="bg-red-600 text-white px-4 py-1.5 flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-3">
                            <span>📞 (888) 555-0199</span>
                            <span className="hidden sm:inline">📍 4250 Auto Drive, Pittsburgh, PA</span>
                          </div>
                          <span>Mon–Sat 9AM–8PM</span>
                        </div>

                        {/* Dealer header */}
                        <div className="border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">
                              {formData.dealerName.charAt(0)}
                            </div>
                            <span className="font-extrabold text-gray-900 text-sm">{formData.dealerName}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {["New", "Pre-Owned", "Specials", "Finance", "Service"].map((item) => (
                              <span key={item} className={cn(
                                "px-2.5 py-1 text-[11px] font-medium rounded-md",
                                item === "Pre-Owned" ? "text-red-600 bg-red-50" : "text-gray-500"
                              )}>{item}</span>
                            ))}
                          </div>
                        </div>

                        {/* Promo banner */}
                        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">🏷 Spring Clearance — Up to $6,000 off select vehicles</span>
                          </div>
                          <span className="text-[10px] font-semibold bg-white/20 rounded px-2 py-0.5">$500 Trade Bonus</span>
                        </div>

                        {/* Search bar */}
                        <div className="border-b border-gray-100 px-4 py-2">
                          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                            <span className="text-gray-400 text-xs">🔍</span>
                            <span className="text-gray-400 text-xs">Search by make, model, year...</span>
                          </div>
                        </div>

                        {/* Filter chips */}
                        <div className="border-b border-gray-100 px-4 py-2 flex items-center gap-1.5 overflow-x-auto">
                          {["All", "SUV", "Sedan", "Truck"].map((chip, i) => (
                            <span key={chip} className={cn(
                              "px-2.5 py-1 text-[10px] font-medium rounded-full border whitespace-nowrap",
                              i === 0 ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-500 border-gray-200"
                            )}>{chip}</span>
                          ))}
                          <span className="text-gray-300 text-[10px]">|</span>
                          {["Apple CarPlay", "AWD", "Heated Seats", "Sunroof"].map((chip) => (
                            <span key={chip} className="px-2.5 py-1 text-[10px] font-medium rounded-full border bg-white text-gray-500 border-gray-200 whitespace-nowrap">{chip}</span>
                          ))}
                        </div>

                        {/* Main content with sidebar */}
                        <div className="flex">
                          {/* Sidebar filters */}
                          <div className="w-[160px] shrink-0 border-r border-gray-100 p-3 space-y-3 hidden md:block">
                            <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Filters</p>

                            <div>
                              <p className="text-[10px] font-semibold text-gray-600 mb-1">Price</p>
                              <div className="h-1 bg-gray-200 rounded-full relative">
                                <div className="absolute left-[10%] right-[20%] h-full bg-red-500 rounded-full" />
                              </div>
                              <div className="flex justify-between mt-0.5">
                                <span className="text-[9px] text-gray-400">$15K</span>
                                <span className="text-[9px] text-gray-400">$55K</span>
                              </div>
                            </div>

                            <div>
                              <p className="text-[10px] font-semibold text-gray-600 mb-1">Year</p>
                              <div className="flex gap-1">
                                <span className="text-[9px] bg-gray-100 rounded px-1.5 py-0.5 text-gray-600">2021</span>
                                <span className="text-[9px] text-gray-400">to</span>
                                <span className="text-[9px] bg-gray-100 rounded px-1.5 py-0.5 text-gray-600">2024</span>
                              </div>
                            </div>

                            {["Make", "Body Style", "Fuel Type", "Transmission", "Mileage", "Drivetrain", "Color"].map((filter) => (
                              <div key={filter}>
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] font-semibold text-gray-600">{filter}</p>
                                  <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Vehicle grid */}
                          <div className="flex-1 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-bold text-gray-900">{inventory.length} Vehicles for Sale</p>
                              <span className="text-[10px] text-gray-400">Sort: Recommended ▾</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {inventory.map((car) => {
                                const thumb = getThumb(car)
                                const noPhotos = car.category === "no-photos" && !isCarDone(car)
                                const msrp = car.price + Math.round(car.price * 0.08)
                                const savings = msrp - car.price
                                return (
                                  <div key={car.id} onClick={() => { setSelectedCarId(car.id); setPhase("fix"); setDividerPos(65); setCurrentPair(0) }}
                                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                                    <div className="relative aspect-[4/3] bg-gray-100">
                                      {thumb && !noPhotos ? (
                                        <Image src={thumb} alt={car.model} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                      ) : (
                                        <Image src={RAW(1)} alt="Coming soon" fill className="object-cover" />
                                      )}
                                      {car.category === "lot-photos" && !isCarDone(car) && (
                                        <div className="absolute top-1.5 left-1.5">
                                          <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">LOT</span>
                                        </div>
                                      )}
                                      {!isCarDone(car) && car.issues.length > 0 && (
                                        <div className="absolute top-1.5 right-1.5">
                                          <span className="bg-red-500 text-white w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center shadow-sm">
                                            {car.issues.length}
                                          </span>
                                        </div>
                                      )}
                                      {isCarDone(car) && (
                                        <div className="absolute top-1.5 right-1.5">
                                          <CheckCircle2 className="h-4 w-4 text-green-500 drop-shadow" />
                                        </div>
                                      )}
                                      {car.hasVinCloned && !isCarDone(car) && (
                                        <div className="absolute bottom-1.5 left-1.5">
                                          <span className="bg-amber-100 text-amber-800 text-[8px] font-semibold px-1.5 py-0.5 rounded border border-amber-200">VIN Cloned</span>
                                        </div>
                                      )}
                                      <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                                        {["◀", "▶"].map((a, ai) => (
                                          <span key={ai} className="w-4 h-4 bg-white/70 rounded-full text-[8px] flex items-center justify-center text-gray-500 backdrop-blur-sm">{a}</span>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="p-2.5">
                                      <p className="font-bold text-gray-900 text-[11px] leading-tight">{car.year} {car.make} {car.model}</p>
                                      <p className="text-[9px] text-gray-400 mt-0.5">{car.trim} · {car.color}</p>
                                      <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-400">
                                        <span>Mileage: {(car.daysOnLot * 850).toLocaleString()}</span>
                                      </div>
                                      <div className="mt-1.5 space-y-0.5">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9px] text-gray-400">MSRP</span>
                                          <span className="text-[9px] text-gray-400 line-through">${msrp.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9px] text-green-600 font-medium">Customer Savings</span>
                                          <span className="text-[9px] text-green-600 font-medium">-${savings.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-gray-100 pt-1 mt-1">
                                          <span className="text-[9px] font-bold text-gray-900">Internet Price</span>
                                          <span className="text-sm font-bold text-gray-900">${car.price.toLocaleString()}</span>
                                        </div>
                                      </div>
                                      <div className="flex gap-1.5 mt-2">
                                        <span className="flex-1 text-center py-1 rounded bg-red-600 text-white text-[9px] font-semibold">Value your Trade</span>
                                        <span className="flex-1 text-center py-1 rounded bg-gray-100 text-gray-700 text-[9px] font-semibold">More Details</span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-center gap-1 mt-4">
                              <span className="w-5 h-5 rounded bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                              {[2, 3, 4, 5].map((p) => (
                                <span key={p} className="w-5 h-5 rounded bg-gray-100 text-gray-500 text-[10px] font-medium flex items-center justify-center">{p}</span>
                              ))}
                              <span className="text-[10px] text-gray-400 ml-1">of {Math.ceil(inventory.length / 12)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Settings + Transform CTA */}
                  {!transformed && (
                    <div className="space-y-3">
                      {/* Settings toggle + Transform button row */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSettingsOpen(!settingsOpen)}
                          className={cn(
                            "rounded-xl border px-4 py-4 text-sm font-medium transition-all flex items-center gap-2 shrink-0",
                            settingsOpen
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-600"
                          )}
                        >
                          <Settings2 className="h-4 w-4" />
                          Settings
                        </button>
                        <button onClick={startTransform} disabled={transforming}
                          className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-80 py-4 text-lg font-bold text-white transition-all flex items-center justify-center gap-3">
                          {transforming ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>{TRANSFORM_LABELS[transformLabelIdx]}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-5 w-5" />
                              <span>Transform All {inventory.length} Vehicles</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Progress bar */}
                      {transforming && (
                        <div className="w-full rounded-full h-2 bg-gray-200 overflow-hidden">
                          <motion.div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                            style={{ width: `${transformProgress}%` }}
                            transition={{ duration: 0.05 }} />
                        </div>
                      )}

                      {/* Settings Panel */}
                      <AnimatePresence>
                        {settingsOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                              {/* Studio / Media Kit tabs */}
                              <div className="flex items-center gap-1 p-2 border-b border-gray-100">
                                <button
                                  onClick={() => setSettingsTab("studio")}
                                  className={cn(
                                    "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2",
                                    settingsTab === "studio"
                                      ? "bg-purple-500 text-white shadow-sm"
                                      : "text-gray-500 hover:bg-gray-50"
                                  )}
                                >
                                  <Sparkles className="h-4 w-4" />
                                  Studio
                                </button>
                                <button
                                  onClick={() => setSettingsTab("mediakit")}
                                  className={cn(
                                    "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2",
                                    settingsTab === "mediakit"
                                      ? "bg-purple-500 text-white shadow-sm"
                                      : "text-gray-500 hover:bg-gray-50"
                                  )}
                                >
                                  <Wand2 className="h-4 w-4" />
                                  Media Kit
                                </button>
                              </div>

                              {/* Studio tab content */}
                              {settingsTab === "studio" && (
                                <div className="p-5 space-y-6">
                                  {/* Backgrounds */}
                                  <div className="space-y-3">
                                    <p className="text-sm font-semibold text-gray-900">Backgrounds</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      {[
                                        { src: PROC(1), label: "Studio White" },
                                        { src: PROC(2), label: "Showroom" },
                                        { src: PROC(3), label: "Outdoor" },
                                        { src: PROC(4), label: "Dark Studio" },
                                      ].map((bg, i) => (
                                        <button
                                          key={i}
                                          onClick={() => setSelectedBg(i)}
                                          className={cn(
                                            "relative rounded-xl overflow-hidden border-2 transition-all aspect-[4/3]",
                                            selectedBg === i
                                              ? "border-purple-500 ring-2 ring-purple-500/20"
                                              : "border-gray-200 hover:border-gray-300"
                                          )}
                                        >
                                          <Image src={bg.src} alt={bg.label} fill className="object-cover" />
                                          {selectedBg === i && (
                                            <div className="absolute top-2 left-2">
                                              <CheckCircle2 className="h-5 w-5 text-purple-500 drop-shadow-md" />
                                            </div>
                                          )}
                                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                            <span className="text-[10px] text-white font-medium">{bg.label}</span>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                    <button className="text-sm text-purple-600 font-medium hover:text-purple-700 flex items-center gap-1">
                                      See All Backgrounds <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                  </div>

                                  {/* Numberplate Masking */}
                                  <div className="flex items-center justify-between py-3 border-t border-gray-100">
                                    <div className="flex items-center gap-3">
                                      <Shield className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-900">Numberplate Masking</span>
                                    </div>
                                    <button
                                      onClick={() => setNumberplateMasking(!numberplateMasking)}
                                      className={cn(
                                        "relative w-11 h-6 rounded-full transition-colors",
                                        numberplateMasking ? "bg-purple-500" : "bg-gray-300"
                                      )}
                                    >
                                      <span className={cn(
                                        "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                                        numberplateMasking ? "translate-x-[22px]" : "translate-x-0.5"
                                      )} />
                                    </button>
                                  </div>

                                  {/* Video Template */}
                                  <div className="space-y-3 border-t border-gray-100 pt-4">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-semibold text-gray-900">Video Template</p>
                                      <button className="text-xs text-purple-600 font-medium hover:text-purple-700 flex items-center gap-1">
                                        See All <ChevronRight className="h-3 w-3" />
                                      </button>
                                    </div>
                                    <div className="flex gap-3">
                                      {[
                                        { label: "Price Overlay", color: "from-blue-600 to-purple-600" },
                                        { label: "Dealer Branded", color: "from-green-600 to-emerald-600" },
                                      ].map((tmpl, i) => (
                                        <button
                                          key={i}
                                          onClick={() => setSelectedVideoTemplate(i)}
                                          className={cn(
                                            "relative rounded-xl overflow-hidden border-2 transition-all w-32 aspect-[3/4]",
                                            selectedVideoTemplate === i
                                              ? "border-purple-500 ring-2 ring-purple-500/20"
                                              : "border-gray-200 hover:border-gray-300"
                                          )}
                                        >
                                          <div className={cn("absolute inset-0 bg-gradient-to-br", tmpl.color, "opacity-90")} />
                                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3">
                                            <Video className="h-6 w-6 mb-2 opacity-80" />
                                            <span className="text-xs font-bold text-center">{tmpl.label}</span>
                                          </div>
                                          {selectedVideoTemplate === i && (
                                            <div className="absolute top-2 left-2">
                                              <CheckCircle2 className="h-5 w-5 text-white drop-shadow-md" />
                                            </div>
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Products */}
                                  <div className="space-y-3 border-t border-gray-100 pt-4">
                                    <p className="text-sm font-semibold text-gray-900">Products</p>
                                    <div className="flex items-center gap-3 flex-wrap">
                                      {[
                                        { id: "images", label: "Images", icon: Camera },
                                        { id: "360spin", label: "360 Spin", icon: RotateCcw },
                                        { id: "videotour", label: "Video Tour", icon: Play },
                                      ].map((product) => {
                                        const active = activeProducts.has(product.id)
                                        return (
                                          <button
                                            key={product.id}
                                            onClick={() => {
                                              setActiveProducts((prev) => {
                                                const next = new Set(prev)
                                                if (next.has(product.id)) next.delete(product.id)
                                                else next.add(product.id)
                                                return next
                                              })
                                            }}
                                            className={cn(
                                              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-all",
                                              active
                                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                                            )}
                                          >
                                            {active ? (
                                              <CheckCircle2 className="h-4 w-4 text-purple-500" />
                                            ) : (
                                              <product.icon className="h-4 w-4" />
                                            )}
                                            {product.label}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Media Kit tab content */}
                              {settingsTab === "mediakit" && (
                                <div className="p-5 space-y-6">
                                  {/* Branding Assets */}
                                  <div className="space-y-3">
                                    <p className="text-sm font-semibold text-gray-900">Branding Assets</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                      {[
                                        { id: "banner", label: "Hero Banner", desc: "Full-width banner for listings", icon: Camera },
                                        { id: "watermark", label: "Logo Watermark", desc: "Subtle branding on every image", icon: Stamp },
                                        { id: "finance", label: "Finance Offer", desc: "0% APR for 60 months", icon: CreditCard },
                                        { id: "award", label: "Award Badge", desc: "Dealer of the Year 2024", icon: Award },
                                        { id: "qr", label: "QR Code", desc: "Direct link to VDP", icon: QrCode },
                                        { id: "tagline", label: "Custom Tagline", desc: "Your brand voice", icon: Type },
                                      ].map((asset) => {
                                        const active = activeMediaKitAssets.has(asset.id)
                                        return (
                                          <button
                                            key={asset.id}
                                            onClick={() => {
                                              setActiveMediaKitAssets((prev) => {
                                                const next = new Set(prev)
                                                if (next.has(asset.id)) next.delete(asset.id)
                                                else next.add(asset.id)
                                                return next
                                              })
                                            }}
                                            className={cn(
                                              "rounded-xl border-2 p-3 text-left transition-all",
                                              active
                                                ? "border-purple-500 bg-purple-50/50 ring-1 ring-purple-500/20"
                                                : "border-gray-200 bg-white hover:border-gray-300"
                                            )}
                                          >
                                            <div className="flex items-start gap-3">
                                              <div className={cn(
                                                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                                active ? "bg-purple-100" : "bg-gray-100"
                                              )}>
                                                <asset.icon className={cn("h-4 w-4", active ? "text-purple-600" : "text-gray-400")} />
                                              </div>
                                              <div className="min-w-0">
                                                <p className={cn("text-sm font-medium truncate", active ? "text-purple-700" : "text-gray-900")}>{asset.label}</p>
                                                <p className="text-[11px] text-gray-400 truncate">{asset.desc}</p>
                                              </div>
                                            </div>
                                            {active && (
                                              <div className="mt-2 flex justify-end">
                                                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                                              </div>
                                            )}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </div>

                                  {/* Overlay Position */}
                                  <div className="space-y-3 border-t border-gray-100 pt-4">
                                    <p className="text-sm font-semibold text-gray-900">Overlay Position</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {["Bottom Left", "Bottom Right", "Top Right", "Top Left"].map((pos, i) => (
                                        <button key={pos} className={cn(
                                          "rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
                                          i === 0 ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                                        )}>
                                          {pos}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Summary */}
                                  <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-3">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                    <p className="text-sm text-green-700">
                                      <span className="font-semibold">{activeMediaKitAssets.size} assets</span> will be applied to all {inventory.length} vehicles
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Post-transform summary */}
                  {transformed && !transforming && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-gradient-to-r from-green-500/15 to-emerald-500/15 border border-green-500/30 p-6 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <p className="text-xl font-bold text-green-600">
                        {inventory.length} vehicles transformed in 1.8 seconds
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        All images listing-ready. VIN-cloned images replaced. Missing photos filled via Smart Match.
                      </p>
                    </motion.div>
                  )}

                  {/* Holding cost callout */}
                  {!transformed && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-700">Daily holding cost across inventory</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">${dailyHoldingCost.toLocaleString()}/day</p>
                        <p className="text-xs text-amber-600 mt-1">
                          {inventory.filter((c) => c.status !== "ready").length} vehicles waiting for listing-ready images.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}


              {/* ═══════════════════════════════════════════════
                 2. TRANSFORM — car detail + before/after
                 ═══════════════════════════════════════════════ */}
              {phase === "fix" && (
                <motion.div key="fix" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {selectedCar && (
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => { setSelectedCarId(null); goTo("inventory") }}
                          className="text-sm text-purple-500 flex items-center gap-1 hover:text-purple-400 transition-colors">
                          <ArrowLeft className="h-4 w-4" /> Back to Inventory
                        </button>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {getThumb(selectedCar) && <Image src={getThumb(selectedCar)} alt={carLabel} fill className="object-cover" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{carLabel}</p>
                            <p className="text-xs text-gray-400">{selectedCar.trim} · {selectedCar.color} · ${selectedCar.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!selectedCarDone && selectedCar.issues.length > 0 && (
                          <Badge className="bg-red-500/20 text-red-600 border-red-500/30 text-xs">
                            {selectedCar.issues.length} issue{selectedCar.issues.length !== 1 && "s"}
                          </Badge>
                        )}
                        {selectedCarDone && (
                          <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Ready
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-gray-500 text-lg">Drag the slider to see before and after.</p>
                  <div ref={containerRef} className="relative rounded-2xl overflow-hidden bg-gray-100 select-none cursor-ew-resize" style={{ aspectRatio: "16/7" }}
                    onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchMove={handleTouchMove} onTouchEnd={handleMouseUp}>
                    <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - dividerPos}% 0 0)` }}>
                      <Image src={activeLotPhotos[currentPair]} alt="Before" fill className="object-cover" />
                      <div className="absolute bottom-4 left-4"><span className="bg-red-500/80 text-white text-sm px-4 py-2 rounded-full font-medium">Before</span></div>
                    </div>
                    <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${dividerPos}%)` }}>
                      <Image src={activeProcessed[currentPair]} alt="After" fill className="object-cover" />
                      <div className="absolute bottom-4 right-4"><span className="bg-green-500/80 text-white text-sm px-4 py-2 rounded-full font-medium">After</span></div>
                    </div>
                    <div className="absolute top-0 bottom-0 z-10" style={{ left: `${dividerPos}%`, transform: "translateX(-50%)" }}>
                      <div className="h-full w-0.5 bg-white/80" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing"
                        onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}>
                        <ChevronLeft className="h-3.5 w-3.5 text-gray-600 -mr-0.5" />
                        <ChevronRight className="h-3.5 w-3.5 text-gray-600 -ml-0.5" />
                      </div>
                    </div>
                  </div>
                  {pairCount > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {Array.from({ length: pairCount }).map((_, i) => (
                        <button key={i} onClick={() => { setCurrentPair(i); setDividerPos(65) }}
                          className={cn("relative w-16 h-12 rounded-lg overflow-hidden shrink-0 ring-2 transition-all", currentPair === i ? "ring-purple-500" : "ring-transparent opacity-50 hover:opacity-80")}>
                          <Image src={activeProcessed[i]} alt={`Pair ${i + 1}`} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {FIXES.map((item, i) => {
                      const done = i < fixStep
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                          className={cn("rounded-xl border p-3 transition-all duration-300", done ? "border-green-500/30 bg-green-500/10" : "border-gray-200 bg-gray-50")}>
                          <div className="flex items-center gap-2">
                            <item.icon className={cn("h-4 w-4", done ? "text-green-400" : "text-gray-400")} />
                            {done && <CheckCircle2 className="h-3 w-3 text-green-400 ml-auto" />}
                          </div>
                          <p className={cn("text-xs font-medium mt-1", done ? "text-green-600" : "text-gray-500")}>{item.label}</p>
                        </motion.div>
                      )
                    })}
                  </div>
                  {fixStep >= FIXES.length && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      {!selectedCarDone && selectedCar && (
                        <>
                          <button onClick={() => startSingleTransform(selectedCar.id)} disabled={transforming}
                            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-80 py-3.5 text-sm font-bold text-white transition-all flex items-center justify-center gap-2">
                            {isTransformingSelected ? (
                              <><Loader2 className="h-4 w-4 animate-spin" /><span>{TRANSFORM_LABELS[transformLabelIdx]}</span></>
                            ) : (
                              <><Wand2 className="h-4 w-4" /><span>Transform This Vehicle</span></>
                            )}
                          </button>
                          {isTransformingSelected && (
                            <div className="w-full rounded-full h-1.5 bg-gray-200 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-75" style={{ width: `${transformProgress}%` }} />
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-5 py-3">
                        <p className="text-sm text-gray-500">All 6 fixes applied automatically. <span className="text-gray-900 font-semibold">Total time: 1.2 seconds.</span></p>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Ready section (inline) ── */}
                  {fixStep >= FIXES.length && selectedCarDone && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6 mt-4">
                      <p className="text-gray-500 text-lg">
                        Your <span className="text-gray-900 font-medium">{carLabel}</span> is ready to list. Right now.
                      </p>
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {activeProcessed.map((src, i) => (
                            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.08 }}
                              className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                              <Image src={src} alt={`Ready ${i + 1}`} fill className="object-cover" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                          <Card className="bg-green-500/10 border-green-500/20 h-full">
                            <CardContent className="p-6">
                              <Clock className="h-6 w-6 text-green-400 mb-3" />
                              <p className="text-sm text-green-600">Time to get listing-ready</p>
                              <div className="mt-2">
                                <span className="text-sm text-red-400 line-through mr-2">3–7 days</span>
                                <span className="text-3xl font-bold text-green-600">1.2 sec</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                          <Card className="bg-purple-500/10 border-purple-500/20 h-full">
                            <CardContent className="p-6">
                              <DollarSign className="h-6 w-6 text-purple-400 mb-3" />
                              <p className="text-sm text-purple-600">Photo editing cost</p>
                              <div className="mt-2">
                                <span className="text-sm text-red-400 line-through mr-2">$300–$570</span>
                                <span className="text-3xl font-bold text-purple-600">$0</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                          <Card className="bg-blue-500/10 border-blue-500/20 h-full">
                            <CardContent className="p-6">
                              <Sparkles className="h-6 w-6 text-blue-400 mb-3" />
                              <p className="text-sm text-blue-600">Listing quality</p>
                              <div className="mt-2">
                                <span className="text-sm text-red-400 line-through mr-2">{score}/100</span>
                                <span className="text-3xl font-bold text-blue-600">94/100</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">What you get for every car</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { icon: Camera, label: "Studio-quality photos", desc: "Clean backgrounds, perfect lighting" },
                            { icon: RotateCcw, label: "360° spin view", desc: "Interactive, from just 4 images" },
                            { icon: Play, label: "Video walkthrough", desc: "Auto-generated, 15 seconds" },
                            { icon: Zap, label: "Ready for every platform", desc: "Website, AutoTrader, Facebook, Google" },
                          ].map((item) => (
                            <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center mb-3">
                                <item.icon className="h-5 w-5 text-purple-400" />
                              </div>
                              <p className="text-sm font-medium text-gray-900">{item.label}</p>
                              <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                        className="rounded-2xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 p-8 text-center">
                        <p className="text-2xl font-bold text-gray-900">This car went from lot to listing-ready in under 2 seconds.</p>
                        <p className="text-gray-500 mt-2 text-lg">No photographer needed. No editing team. No days of waiting.</p>
                        <button onClick={() => goTo("golive")}
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-3 text-sm font-semibold text-white transition-colors">
                          <Send className="h-4 w-4" /> Go Live — Publish Everywhere
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════
                 4. GO LIVE
                 ═══════════════════════════════════════════════ */}
              {phase === "golive" && (
                <motion.div key="golive" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <p className="text-gray-500 text-lg">
                    Publish <span className="text-gray-900 font-medium">{formData.dealerName}</span>&apos;s listing-ready inventory across every channel.
                  </p>

                  {/* Publishing channels */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Publishing Destinations</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {PUBLISH_CHANNELS.map((ch) => {
                        const active = !ch.comingSoon && publishChannels.has(ch.id)
                        return (
                          <button key={ch.id}
                            onClick={() => !ch.comingSoon && setPublishChannels((prev) => { const n = new Set(prev); n.has(ch.id) ? n.delete(ch.id) : n.add(ch.id); return n })}
                            className={cn("rounded-xl border p-4 text-left transition-all relative", ch.comingSoon ? "border-gray-200 bg-gray-50/50 opacity-60 cursor-not-allowed" : active ? "border-purple-500/40 bg-purple-500/10 ring-1 ring-purple-500/30" : "border-gray-200 bg-gray-50 hover:border-gray-300")}>
                            <div className="flex items-center justify-between mb-2">
                              <ch.icon className={cn("h-5 w-5", active ? "text-purple-500" : "text-gray-400")} />
                              {ch.comingSoon ? (
                                <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">Coming Soon</span>
                              ) : (
                                <div className={cn("w-9 h-5 rounded-full p-0.5 transition-colors", active ? "bg-purple-500" : "bg-gray-300")}>
                                  <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", active && "translate-x-4")} />
                                </div>
                              )}
                            </div>
                            <p className={cn("text-sm font-semibold", ch.comingSoon ? "text-gray-400" : active ? "text-purple-700" : "text-gray-700")}>{ch.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{ch.desc}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Smart Campaign */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Smart Campaign</p>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {CAMPAIGN_TYPES.map((t) => (
                          <button key={t} onClick={() => setCampaignType(t)}
                            className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                              campaignType === t ? "bg-purple-500 text-white border-purple-500" : "bg-white text-gray-600 border-gray-200 hover:border-purple-300")}>
                            {t}
                          </button>
                        ))}
                      </div>
                      <div className="relative rounded-xl overflow-hidden aspect-[16/7] bg-gray-200">
                        <Image src={PROC(1)} alt="Campaign" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">{campaignType}</span>
                          <p className="text-white text-lg font-bold mt-1">{selectedCar ? `${carLabel} — $${selectedCar.price.toLocaleString()}` : `${formData.dealerName} — Spring Event`}</p>
                          <p className="text-white/70 text-sm">Studio-quality photos. Verified listing. Ready to sell.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Media Kit */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Media Kit</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { label: "Hero Image", icon: Camera },
                        { label: "Watermarked", icon: Shield },
                        { label: "Finance Card", icon: DollarSign },
                        { label: "Badge Overlay", icon: Sparkles },
                        { label: "QR Code", icon: ExternalLink },
                        { label: "Tagline", icon: MessageSquare },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
                          <div className="w-full aspect-square rounded-lg bg-gray-100 flex items-center justify-center mb-2">
                            <item.icon className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-xs font-medium text-gray-600">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Publish CTA */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-5 py-3">
                    <p className="text-sm text-gray-500">{publishChannels.size} channel{publishChannels.size !== 1 ? "s" : ""} selected</p>
                    <button onClick={() => goTo("impact")}
                      className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors">
                      Publish to {publishChannels.size} Channel{publishChannels.size !== 1 ? "s" : ""} <ChevronRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════
                 6. IMPACT
                 ═══════════════════════════════════════════════ */}
              {phase === "impact" && (
                <motion.div key="impact" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* ── Intelligence ── */}
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-500" />
                    <h2 className="font-semibold text-lg text-gray-900">Intelligence</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Website Signal */}
                    <Card className="h-full">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-900">Website Signal</span>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                          <ScoreRing value={websiteScore} size={88} stroke={7} color={websiteScore >= 75 ? "text-green-500" : websiteScore >= 55 ? "text-amber-500" : "text-red-500"} />
                          <div className="w-full space-y-1.5">
                            {websiteDimensions.map((d) => (
                              <div key={d.label} className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{d.label}</span>
                                <span className={cn("font-medium", d.score >= 70 ? "text-green-600" : d.score >= 50 ? "text-amber-600" : "text-red-600")}>{d.score}</span>
                              </div>
                            ))}
                          </div>
                          <div className="w-full rounded-lg bg-gray-50 px-3 py-2 mt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Listing images</span>
                              <span className={cn("font-medium", fullPct >= 55 ? "text-green-600" : "text-red-600")}>{fullPct >= 55 ? "Present" : "Missing"}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Image Diagnosis */}
                    <Card className="h-full">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Camera className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-semibold text-gray-900">Image Diagnosis</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={cn("text-[10px]", imageConfidence === "high" ? "bg-green-50 text-green-700 border-green-200" : imageConfidence === "medium" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200")}>
                            Confidence: {imageConfidence}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {imageIssues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs rounded-lg border border-gray-200 px-2.5 py-2">
                              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                              <span className="text-gray-600">{issue}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Smart Match */}
                    <Card className="h-full">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold text-gray-900">Smart Match</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={cn("text-[10px]", smartMatchTriggered ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200")}>
                            {smartMatchTriggered ? "Triggered" : "Monitor"}
                          </Badge>
                          <span className="text-xs text-gray-500">{totalMissingUnits} units</span>
                        </div>
                        <div className="space-y-2">
                          {smartMatchCandidates.map((c) => (
                            <div key={c.makeModel} className="rounded-lg border border-gray-200 p-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-900">{c.makeModel}</span>
                                <Badge variant="outline" className={cn("text-[9px]", c.priority === "high" ? "border-red-200 text-red-600" : c.priority === "medium" ? "border-amber-200 text-amber-600" : "border-gray-200 text-gray-500")}>
                                  {c.priority}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-1">{c.missingUnits} missing</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* ── Impact Summary ── */}
                  <Card className="border-purple-500/20 bg-purple-500/[0.02]">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="h-4 w-4 text-purple-500" />
                        <h3 className="font-semibold text-base text-gray-900">Impact Summary</h3>
                        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] ml-auto">If you execute in 30 days</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="rounded-xl bg-white border border-gray-200 p-4">
                          <p className="text-xs text-gray-500">Cars at risk</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{carsAtRisk}</p>
                          <p className="text-[10px] text-gray-400">per month</p>
                        </div>
                        <div className="rounded-xl bg-white border border-gray-200 p-4">
                          <p className="text-xs text-gray-500">Monthly exposure</p>
                          <p className="text-2xl font-bold text-red-600 mt-1">${monthlyExposure.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400">holding + lead leakage</p>
                        </div>
                        <div className="rounded-xl bg-white border border-gray-200 p-4">
                          <p className="text-xs text-gray-500">Recoverable</p>
                          <p className="text-2xl font-bold text-green-600 mt-1">${recoverable.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400">with 30-day pilot</p>
                        </div>
                        <div className="rounded-xl bg-white border border-gray-200 p-4">
                          <p className="text-xs text-gray-500">Holding cost</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">${hcPerDay}</p>
                          <p className="text-[10px] text-gray-400">per vehicle / day</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ── Presentation Output ── */}
                  <Card>
                    <CardContent className="p-5 space-y-5">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-500" />
                        <h3 className="font-semibold text-base text-gray-900">Presentation Output</h3>
                      </div>

                      {/* Executive Summary */}
                      <div className="rounded-xl border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/80 to-transparent p-4">
                        <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-1.5">Executive Summary</p>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {formData.dealerName} is losing momentum on ~<strong>{carsAtRisk} cars/mo</strong> due to visual coverage gaps across <strong>{rooftopCount} rooftop{rooftopCount > 1 ? "s" : ""}</strong>. A 30-day pilot recovers <strong className="text-green-700">${recoverable.toLocaleString()}/mo</strong>.
                        </p>
                      </div>

                      {/* Key Talking Points */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Key Talking Points</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="rounded-xl border border-red-200 bg-red-50/50 p-3.5">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Target className="h-3.5 w-3.5 text-red-500" />
                              <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">The Gap</span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed">Only {fullPct}% of listings have complete images — {100 - fullPct}% are costing buyer attention daily.</p>
                          </div>
                          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
                            <div className="flex items-center gap-2 mb-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                              <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">The Cost</span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed">${(carsAtRisk * hcPerDay).toLocaleString()}/day in holding costs on {carsAtRisk} vehicles without proper photos.</p>
                          </div>
                          <div className="rounded-xl border border-green-200 bg-green-50/50 p-3.5">
                            <div className="flex items-center gap-2 mb-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">The Fix</span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed">Smart Match fills gaps instantly. Every car listing-ready in 1.2s — no editing team needed.</p>
                          </div>
                        </div>
                      </div>

                      {/* 30-Day Pilot Plan */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">30-Day Pilot Plan</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-xl border border-gray-200 p-3.5 border-l-4 border-l-blue-400">
                            <p className="text-xs font-semibold text-blue-700">Week 1</p>
                            <p className="text-[11px] text-gray-500 mt-1">Baseline + prioritize {noPhotosCount > 0 ? `${noPhotosCount} zero-photo vehicles` : "coverage gaps"}</p>
                          </div>
                          <div className="rounded-xl border border-gray-200 p-3.5 border-l-4 border-l-purple-400">
                            <p className="text-xs font-semibold text-purple-700">Week 2–3</p>
                            <p className="text-[11px] text-gray-500 mt-1">Smart Match recovery + integration</p>
                          </div>
                          <div className="rounded-xl border border-gray-200 p-3.5 border-l-4 border-l-green-400">
                            <p className="text-xs font-semibold text-green-700">Week 4</p>
                            <p className="text-[11px] text-gray-500 mt-1">Review lift + scale all {rooftopCount} rooftop{rooftopCount > 1 ? "s" : ""}</p>
                          </div>
                        </div>
                      </div>

                      {/* Close Actions */}
                      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Next Steps</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {[
                            "Confirm pilot sponsor",
                            "Lock start date",
                            "Share briefing internally",
                            `$${(carsAtRisk * hcPerDay).toLocaleString()}/day cost of waiting`,
                          ].map((action, i) => (
                            <div key={i} className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-3 py-2">
                              <div className="flex items-center justify-center h-4 w-4 rounded-full bg-purple-500 text-white text-[9px] font-bold shrink-0">{i + 1}</div>
                              <span className="text-[11px] text-gray-700">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ── Objection Handling ── */}
                  <Card>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-500" />
                        <h3 className="font-semibold text-base text-gray-900">Objection Handling</h3>
                      </div>
                      <div className="space-y-2">
                        {OBJECTION_SNIPPETS.map((obj, i) => (
                          <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
                            <button onClick={() => setOpenObjection(openObjection === i ? null : i)}
                              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                              <span className="text-sm font-medium text-gray-900">&ldquo;{obj.objection}&rdquo;</span>
                              <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform shrink-0 ml-2", openObjection === i && "rotate-180")} />
                            </button>
                            {openObjection === i && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-gray-200 px-4 py-3 space-y-2">
                                <p className="text-sm text-gray-600">{obj.response}</p>
                                <div className="rounded-lg border-l-2 border-l-amber-400 bg-amber-50/50 px-3 py-2">
                                  <p className="text-xs text-amber-800"><span className="font-medium">What to say:</span> {obj.whatToSay}</p>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  )
}
