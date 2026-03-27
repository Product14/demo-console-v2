"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  Globe,
  ImageOff,
  Layers,
  Loader2,
  Palette,
  RotateCcw,
  Shield,
  Sparkles,
  Sun,
  Target,
  Upload,
  Wand2,
  X,
  Zap,
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════

type Phase = "form" | "analyzing" | "vlp" | "vdp"
type CarCategory = "lot-photos" | "vin-cloned" | "no-photos" | "ready"

interface FormData {
  dealerName: string
  dealerUrl: string
  carCount: string
  issuesFromAE: string
  screenshotName: string
}

interface CarIssue {
  label: string
  detail: string
  severity: "high" | "medium" | "low"
  fixLabel: string
  fixMethod: string
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
  spynePhotos: string[]
  issues: CarIssue[]
  hasVinCloned: boolean
  status: "needs-review" | "ready"
  holdingCostPerDay: number
  category: CarCategory
}

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════

const RAW = (n: number) => `/demo-console/raw/raw-${String(n).padStart(2, "0")}.png`
const PROC = (n: number) => `/demo-console/processed/processed-${String(n).padStart(2, "0")}.png`

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

const ISSUE_POOL: CarIssue[] = [
  { label: "No image", detail: "Vehicle has zero photos — invisible to online buyers", severity: "high", fixLabel: "Images generated via Smart Match", fixMethod: "Smart Match" },
  { label: "Wrong angle", detail: "Unflattering or incorrect camera perspective", severity: "high", fixLabel: "Angle corrected using AI", fixMethod: "AI Enhancement" },
  { label: "Low quality images", detail: "Resolution below marketplace minimum standards", severity: "high", fixLabel: "Enhanced to HD quality", fixMethod: "AI Enhancement" },
  { label: "Distracting background", detail: "Parking lot clutter visible behind vehicle", severity: "high", fixLabel: "Background replaced with studio finish", fixMethod: "Background Removal" },
  { label: "Cut-off / cropped images", detail: "Vehicle partially cropped at frame edges", severity: "high", fixLabel: "Reframed with full vehicle visible", fixMethod: "AI Enhancement" },
  { label: "Missing angle coverage", detail: "Key angles not captured — incomplete set", severity: "high", fixLabel: "Missing angles filled via Smart Match", fixMethod: "Smart Match" },
  { label: "Inconsistent framing", detail: "Photos cropped differently across angles", severity: "medium", fixLabel: "Standardized to consistent composition", fixMethod: "AI Enhancement" },
  { label: "Bad lighting / shadows", detail: "Poor exposure creating unappealing images", severity: "medium", fixLabel: "Lighting and exposure corrected", fixMethod: "AI Enhancement" },
  { label: "VIN-cloned stock images", detail: "Photos from a different vehicle — buyer mistrust", severity: "high", fixLabel: "Replaced with actual vehicle photos", fixMethod: "Smart Match" },
  { label: "Watermarks present", detail: "Third-party watermarks blocking vehicle view", severity: "medium", fixLabel: "Watermarks removed cleanly", fixMethod: "AI Enhancement" },
  { label: "Dealer banners blocking", detail: "Promotional overlays blocking vehicle view", severity: "high", fixLabel: "Banners removed, vehicle fully visible", fixMethod: "AI Enhancement" },
  { label: "No branding", detail: "No dealer identity on listing images", severity: "low", fixLabel: "Dealer branding applied consistently", fixMethod: "Branding" },
]

const ANALYSIS_STEPS = [
  "Connecting to dealer website…",
  "Crawling inventory pages…",
  "Analyzing listing images…",
  "Detecting image quality issues…",
  "Checking angle coverage…",
  "Identifying VIN-cloned photos…",
  "Computing quality scores…",
  "Generating report…",
]

const TRANSFORM_STEPS = [
  "Analyzing inventory images…",
  "Removing distracting backgrounds…",
  "Correcting bad angles…",
  "Removing watermarks and banners…",
  "Running Smart Match for missing photos…",
  "Applying AI enhancements…",
  "Optimizing for marketplace standards…",
  "Applying dealer branding…",
  "Finalizing all vehicles…",
]

const VDP_FIXES = [
  { icon: Layers, label: "Background replaced" },
  { icon: Sun, label: "Lighting fixed" },
  { icon: RotateCcw, label: "Angle corrected" },
  { icon: Palette, label: "Color normalized" },
  { icon: Eye, label: "HD quality applied" },
  { icon: Shield, label: "Plate masked" },
]

// ═══════════════════════════════════════════════════════════════
//  INVENTORY GENERATOR
// ═══════════════════════════════════════════════════════════════

function pickIssues(idx: number, count: number): CarIssue[] {
  const result: CarIssue[] = []
  const used = new Set<number>()
  for (let j = 0; j < count; j++) {
    let pick = (idx * 3 + j * 5) % ISSUE_POOL.length
    while (used.has(pick)) pick = (pick + 1) % ISSUE_POOL.length
    used.add(pick)
    result.push({ ...ISSUE_POOL[pick] })
  }
  return result
}

function buildInventory(carCount: number): InventoryCar[] {
  const count = Math.max(8, Math.min(60, carCount || 30))
  const cars: InventoryCar[] = []

  for (let i = 0; i < count; i++) {
    let cat: CarCategory
    if (i < 2) cat = "ready"
    else if (i < Math.floor(count * 0.15)) cat = "no-photos"
    else if (i < Math.floor(count * 0.35)) cat = "vin-cloned"
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

    let issues: CarIssue[]
    if (cat === "ready") {
      issues = []
    } else if (cat === "no-photos") {
      issues = [{ ...ISSUE_POOL[0] }]
    } else {
      const issueCount = 2 + ((i * 3) % 3)
      issues = pickIssues(i, issueCount)
      if (cat === "vin-cloned") {
        issues.unshift({ ...ISSUE_POOL[8] })
      }
    }

    const rawCount = cat === "lot-photos" ? 3 + (i % 3) : cat === "vin-cloned" ? 2 + (i % 2) : 0
    const lotPhotos = Array.from({ length: rawCount }, (_, j) => RAW(((i * 3 + j) % 11) + 1))
    const spCount = cat === "ready" ? 4 + (i % 3) : cat !== "no-photos" ? 3 + (i % 3) : 3 + (i % 2)
    const spynePhotos = Array.from({ length: spCount }, (_, j) => PROC(((i * 2 + j) % 8) + 1))

    cars.push({
      id: `inv-${i}`,
      stockNo, year,
      make: mm.make, model: mm.model, trim, color,
      vin, daysOnLot, price,
      lotPhotos, spynePhotos,
      issues, hasVinCloned: cat === "vin-cloned",
      status: cat === "ready" ? "ready" : "needs-review",
      holdingCostPerDay: 45,
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
  return Math.max(12, s)
}

// ═══════════════════════════════════════════════════════════════
//  SCORE RING
// ═══════════════════════════════════════════════════════════════

function ScoreRing({ score, size = 72, sw = 6 }: { score: number; size?: number; sw?: number }) {
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444"
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} className="text-gray-200" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }} style={{ strokeDasharray: `${circ}` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
        <span className="text-[9px] text-gray-400">/100</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function DemoConsoleV2Page() {
  // ── Form state ──
  const [formData, setFormData] = useState<FormData>({
    dealerName: "",
    dealerUrl: "",
    carCount: "",
    issuesFromAE: "",
    screenshotName: "",
  })
  const screenshotRef = useRef<HTMLInputElement>(null)
  function updateForm(key: keyof FormData, v: string) { setFormData(p => ({ ...p, [key]: v })) }

  // ── Core state ──
  const [phase, setPhase] = useState<Phase>("form")
  const [inventory, setInventory] = useState<InventoryCar[]>([])
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null)

  // ── Analysis animation ──
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStep, setAnalysisStep] = useState(0)

  // ── VLP transform state ──
  const [vlpTransformed, setVlpTransformed] = useState(false)
  const [vlpTransforming, setVlpTransforming] = useState(false)
  const [vlpTransformProgress, setVlpTransformProgress] = useState(0)
  const [vlpTransformLabel, setVlpTransformLabel] = useState(0)

  // ── VDP transform state ──
  const [vdpTransformed, setVdpTransformed] = useState(false)
  const [vdpTransforming, setVdpTransforming] = useState(false)
  const [vdpTransformProgress, setVdpTransformProgress] = useState(0)
  const [vdpFixStep, setVdpFixStep] = useState(0)

  // ── Before/After slider ──
  const [dividerPos, setDividerPos] = useState(50)
  const [currentPair, setCurrentPair] = useState(0)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Derived data ──
  const selectedCar = useMemo(() => inventory.find(c => c.id === selectedCarId) ?? null, [inventory, selectedCarId])
  const totalIssues = useMemo(() => inventory.reduce((s, c) => s + c.issues.length, 0), [inventory])
  const noPhotosCount = useMemo(() => inventory.filter(c => c.category === "no-photos").length, [inventory])
  const vinClonedCount = useMemo(() => inventory.filter(c => c.hasVinCloned).length, [inventory])
  const carsWithIssues = useMemo(() => inventory.filter(c => c.issues.length > 0).length, [inventory])

  const formReady = formData.dealerName.trim().length > 1 && formData.dealerUrl.trim().length > 5

  // ── Analysis animation effect ──
  useEffect(() => {
    if (phase !== "analyzing") return
    let step = 0
    const total = 80
    const timer = setInterval(() => {
      step++
      setAnalysisProgress((step / total) * 100)
      setAnalysisStep(Math.min(ANALYSIS_STEPS.length - 1, Math.floor((step / total) * ANALYSIS_STEPS.length)))
      if (step >= total) {
        clearInterval(timer)
        setTimeout(() => {
          const inv = buildInventory(Number(formData.carCount) || 30)
          setInventory(inv)
          setPhase("vlp")
        }, 400)
      }
    }, 50)
    return () => clearInterval(timer)
  }, [phase, formData.carCount])

  // ── VLP transform animation ──
  useEffect(() => {
    if (!vlpTransforming) return
    let step = 0
    const total = 70
    const timer = setInterval(() => {
      step++
      setVlpTransformProgress((step / total) * 100)
      setVlpTransformLabel(Math.min(TRANSFORM_STEPS.length - 1, Math.floor((step / total) * TRANSFORM_STEPS.length)))
      if (step >= total) {
        clearInterval(timer)
        setTimeout(() => { setVlpTransforming(false); setVlpTransformed(true) }, 300)
      }
    }, 50)
    return () => clearInterval(timer)
  }, [vlpTransforming])

  // ── VDP transform animation ──
  useEffect(() => {
    if (!vdpTransforming) return
    let step = 0
    const total = 50
    const timer = setInterval(() => {
      step++
      setVdpTransformProgress((step / total) * 100)
      setVdpFixStep(Math.min(VDP_FIXES.length, Math.floor((step / total) * (VDP_FIXES.length + 1))))
      if (step >= total) {
        clearInterval(timer)
        setTimeout(() => { setVdpTransforming(false); setVdpTransformed(true) }, 300)
      }
    }, 50)
    return () => clearInterval(timer)
  }, [vdpTransforming])

  // ── Handlers ──
  function handleAnalyze() {
    if (!formReady) return
    setPhase("analyzing")
    setAnalysisProgress(0)
    setAnalysisStep(0)
  }

  function handleScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) updateForm("screenshotName", f.name)
  }

  function handleSelectCar(car: InventoryCar) {
    setSelectedCarId(car.id)
    setVdpTransformed(false)
    setVdpTransforming(false)
    setVdpFixStep(0)
    setVdpTransformProgress(0)
    setDividerPos(50)
    setCurrentPair(0)
    setPhase("vdp")
  }

  function handleBackToVlp() {
    setSelectedCarId(null)
    setPhase("vlp")
  }

  function startVlpTransform() {
    setVlpTransforming(true)
    setVlpTransformProgress(0)
    setVlpTransformLabel(0)
  }

  function startVdpTransform() {
    setVdpTransforming(true)
    setVdpTransformProgress(0)
    setVdpFixStep(0)
  }

  function getThumb(car: InventoryCar): string {
    if (vlpTransformed) return car.spynePhotos[0] || PROC(1)
    return car.lotPhotos[0] || ""
  }

  // ── Slider handlers ──
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

  const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-gray-900 placeholder:text-gray-400 text-sm outline-none transition-all focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"

  // ═══════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ════════════════════════════════════════════════════════════
         PHASE 1: DEALER INTAKE FORM
         ════════════════════════════════════════════════════════════ */}
      {phase === "form" && (
        <div className="flex items-center justify-center min-h-screen px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-[#6C47FF]" />
                <span className="text-gray-900 font-bold text-xl">spyne</span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-purple-600 font-medium">Demo Console 2.0</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Dealer Website Analysis</h1>
              <p className="text-gray-500 mt-2">Enter the dealership details below to analyze their current online presence</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-sm text-gray-500">Dealer / Group Name *</span>
                  <input value={formData.dealerName} onChange={e => updateForm("dealerName", e.target.value)}
                    placeholder="e.g. Desert Valley Auto Group" className={inputCls} />
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-sm text-gray-500">Dealer Website URL *</span>
                  <input value={formData.dealerUrl} onChange={e => updateForm("dealerUrl", e.target.value)}
                    placeholder="e.g. https://desertvalleyauto.com" className={inputCls} />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm text-gray-500">Number of Cars in Inventory</span>
                  <input value={formData.carCount} onChange={e => updateForm("carCount", e.target.value)}
                    type="number" placeholder="e.g. 45" className={inputCls} />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm text-gray-500">Issues Found (First Analysis by AE)</span>
                  <input value={formData.issuesFromAE} onChange={e => updateForm("issuesFromAE", e.target.value)}
                    placeholder="e.g. Bad images, no 360°, inconsistent" className={inputCls} />
                </label>
              </div>

              {/* Screenshot Upload */}
              <div>
                <span className="text-sm text-gray-500 block mb-1.5">Upload a Screenshot of their Website</span>
                <div
                  onClick={() => screenshotRef.current?.click()}
                  className="group rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-500/40 transition-all cursor-pointer p-8 text-center hover:bg-purple-500/[0.03]"
                >
                  {formData.screenshotName ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <span className="text-sm text-green-600">{formData.screenshotName}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-gray-300 group-hover:text-purple-400/60 transition-colors mb-2" />
                      <p className="text-sm text-gray-400">Click to upload or drag & drop</p>
                      <p className="text-xs text-gray-300 mt-1">PNG, JPG up to 10MB</p>
                    </>
                  )}
                  <input ref={screenshotRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
                </div>
              </div>
            </div>

            <button onClick={handleAnalyze} disabled={!formReady}
              className={cn(
                "w-full rounded-xl py-4 text-lg font-semibold transition-all flex items-center justify-center gap-2",
                formReady
                  ? "bg-purple-600 hover:bg-purple-500 text-white"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              )}>
              <Globe className="h-5 w-5" /> Analyze Website
            </button>
          </motion.div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
         PHASE 2: ANALYZING ANIMATION
         ════════════════════════════════════════════════════════════ */}
      {phase === "analyzing" && (
        <div className="flex items-center justify-center min-h-screen px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full text-center space-y-8">
            <div>
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-purple-400 animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Analyzing {formData.dealerName || "dealer"}&apos;s website</h2>
              <p className="text-gray-400 mt-2 font-mono text-sm">{formData.dealerUrl}</p>
            </div>

            <div className="space-y-3">
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  style={{ width: `${analysisProgress}%` }} />
              </div>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                <span className="text-sm text-purple-600">{ANALYSIS_STEPS[analysisStep]}</span>
              </div>
              <p className="text-xs text-gray-400">{Math.round(analysisProgress)}% complete</p>
            </div>

            <div className="space-y-2">
              {ANALYSIS_STEPS.map((step, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={i <= analysisStep ? { opacity: 1, x: 0 } : { opacity: 0.2, x: 0 }}
                  className="flex items-center gap-2 text-sm">
                  {i < analysisStep ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                  ) : i === analysisStep ? (
                    <Loader2 className="h-4 w-4 text-purple-400 animate-spin shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-200 shrink-0" />
                  )}
                  <span className={cn(i <= analysisStep ? "text-gray-600" : "text-gray-300")}>{step}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
         PHASE 3: VLP — Vehicle Listing Page (Website View)
         ════════════════════════════════════════════════════════════ */}
      {phase === "vlp" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">

          {/* Header */}
          <div className="border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <p className="text-xs uppercase tracking-widest text-purple-400 mb-1">Website Analysis · {formData.dealerName}</p>
              <h1 className="text-3xl font-bold tracking-tight">
                {vlpTransformed ? (
                  <>All listings <span className="text-green-400">fixed and ready</span></>
                ) : (
                  <>We found <span className="text-red-400">{totalIssues} issues</span> across {carsWithIssues} vehicles</>
                )}
              </h1>
              <p className="text-gray-400 mt-1">
                {vlpTransformed
                  ? "Every vehicle now has studio-quality images and complete angle coverage."
                  : "Click on any vehicle card to see the detailed analysis."}
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">Total Listings</p>
                  <p className="text-2xl font-bold mt-1">{inventory.length}</p>
                </div>
                <div className={cn("rounded-xl border p-4", vlpTransformed ? "border-green-500/20 bg-green-500/5" : "border-amber-500/20 bg-amber-500/5")}>
                  <p className="text-xs text-gray-400">Issues Found</p>
                  <p className={cn("text-2xl font-bold mt-1", vlpTransformed ? "text-green-600" : "text-amber-600")}>
                    {vlpTransformed ? "0" : totalIssues}
                  </p>
                  {vlpTransformed && <p className="text-xs text-green-600 mt-0.5">All resolved</p>}
                </div>
                <div className={cn("rounded-xl border p-4", vlpTransformed ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5")}>
                  <p className="text-xs text-gray-400">No Photos</p>
                  <p className={cn("text-2xl font-bold mt-1", vlpTransformed ? "text-green-600" : "text-red-600")}>
                    {vlpTransformed ? "0" : noPhotosCount}
                  </p>
                  {vlpTransformed && <p className="text-xs text-green-600 mt-0.5">Smart Matched</p>}
                </div>
                <div className={cn("rounded-xl border p-4", vlpTransformed ? "border-green-500/20 bg-green-500/5" : "border-purple-500/20 bg-purple-500/5")}>
                  <p className="text-xs text-gray-400">VIN Cloned</p>
                  <p className={cn("text-2xl font-bold mt-1", vlpTransformed ? "text-green-600" : "text-purple-600")}>
                    {vlpTransformed ? "0" : vinClonedCount}
                  </p>
                  {vlpTransformed && <p className="text-xs text-green-600 mt-0.5">Replaced</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Website mock */}
          <div className="max-w-7xl mx-auto px-6 py-6">

            <div className="rounded-2xl overflow-hidden border border-gray-200">
              {/* Browser chrome */}
              <div className="border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 bg-gray-50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white rounded-lg px-3 py-1.5 text-sm text-gray-400 font-mono truncate border">
                  {formData.dealerUrl || "https://dealer.example.com"}/inventory
                </div>
              </div>

              {/* Website SRP */}
              <div className="bg-gray-50 p-6 max-h-[700px] overflow-y-auto">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div>
                    <p className="text-gray-900 text-xl font-bold">{formData.dealerName || "Dealer"}</p>
                    <p className="text-gray-500 text-sm">{inventory.length} vehicles available</p>
                  </div>
                  {vlpTransformed && (
                    <span className="bg-green-100 text-green-700 text-sm px-4 py-2 rounded-full font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> All Issues Fixed
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {inventory.map((car) => {
                    const thumb = getThumb(car)
                    const noPhotos = car.category === "no-photos" && !vlpTransformed
                    const score = qualityScore(car.issues)
                    return (
                      <div key={car.id} onClick={() => handleSelectCar(car)}
                        className={cn(
                          "bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group relative",
                          !vlpTransformed && car.issues.length > 0 ? "border-red-200" : "border-gray-200",
                          vlpTransformed && "border-green-200",
                        )}>
                        <div className="relative aspect-[4/3] bg-gray-100">
                          {thumb && !noPhotos ? (
                            <Image src={thumb} alt={car.model} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                              <ImageOff className="h-8 w-8 text-gray-300" />
                              <span className="text-xs text-gray-400 mt-2">No photo available</span>
                            </div>
                          )}

                          {/* Issue overlay badges — BEFORE transform */}
                          {!vlpTransformed && car.issues.length > 0 && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
                              <div className="absolute top-2 right-2">
                                <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">
                                  {car.issues.length} issue{car.issues.length !== 1 && "s"}
                                </span>
                              </div>
                              <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                                {car.issues.slice(0, 2).map((issue, i) => (
                                  <span key={i} className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                                    {issue.label}
                                  </span>
                                ))}
                                {car.issues.length > 2 && (
                                  <span className="bg-black/60 text-white/70 text-[9px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                                    +{car.issues.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* VIN cloned badge */}
                          {!vlpTransformed && car.hasVinCloned && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded font-bold border border-red-200">
                                VIN Cloned
                              </span>
                            </div>
                          )}

                          {/* Post-transform badge */}
                          {vlpTransformed && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle2 className="h-5 w-5 text-green-500 drop-shadow" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-gray-900 text-sm">{car.year} {car.make} {car.model}</p>
                          <p className="text-xs text-gray-400">{car.trim} · {car.color}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-base font-bold text-gray-900">${car.price.toLocaleString()}</p>
                            {vlpTransformed ? (
                              <span className="text-[10px] text-green-600 font-semibold">Ready</span>
                            ) : car.issues.length > 0 ? (
                              <span className="text-[10px] text-red-500 font-semibold">Quality: {score}/100</span>
                            ) : (
                              <span className="text-[10px] text-green-600 font-semibold">Clean</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── Transform CTA ── */}
            {!vlpTransformed && (
              <div className="mt-6 space-y-3">
                <button onClick={startVlpTransform} disabled={vlpTransforming}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-80 py-4 text-lg font-bold text-white transition-all flex items-center justify-center gap-3">
                  {vlpTransforming ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{TRANSFORM_STEPS[vlpTransformLabel]}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      <span>Transform All {inventory.length} Vehicles</span>
                    </>
                  )}
                </button>
                {vlpTransforming && (
                  <div className="w-full rounded-full h-2 bg-gray-200 overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      style={{ width: `${vlpTransformProgress}%` }} />
                  </div>
                )}
              </div>
            )}

            {/* ── Post-transform success ── */}
            {vlpTransformed && !vlpTransforming && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                <div className="rounded-xl bg-gradient-to-r from-green-500/15 to-emerald-500/15 border border-green-500/30 p-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-green-600">
                    {inventory.length} vehicles transformed successfully
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    All images are now listing-ready. VIN-cloned images replaced. Missing photos filled via Smart Match.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-center">
                    <Camera className="h-5 w-5 text-green-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Images Fixed</p>
                    <p className="text-xl font-bold text-green-600">{totalIssues}</p>
                  </div>
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-center">
                    <Zap className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Smart Match Used</p>
                    <p className="text-xl font-bold text-purple-600">{noPhotosCount}</p>
                  </div>
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
                    <Sparkles className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">AI Enhanced</p>
                    <p className="text-xl font-bold text-blue-600">{carsWithIssues}</p>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                    <Clock className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Total Time</p>
                    <p className="text-xl font-bold text-amber-600">3.5s</p>
                  </div>
                </div>

                <p className="text-center text-gray-400 text-sm">Click on any vehicle card above to see detailed before/after analysis</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════
         PHASE 4: VDP — Vehicle Detail Page
         ════════════════════════════════════════════════════════════ */}
      {phase === "vdp" && selectedCar && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">

          {/* Header */}
          <div className="border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <button onClick={handleBackToVlp} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-3">
                <ArrowLeft className="h-4 w-4" /> Back to all listings
              </button>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-bold">{selectedCar.year} {selectedCar.make} {selectedCar.model} {selectedCar.trim}</h1>
                  <p className="text-gray-400 text-sm">{selectedCar.color} · VIN: {selectedCar.vin} · Stock #{selectedCar.stockNo}</p>
                </div>
                <div className="flex items-center gap-3">
                  {!vdpTransformed && selectedCar.issues.length > 0 && (
                    <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
                      {selectedCar.issues.length} issue{selectedCar.issues.length !== 1 && "s"} found
                    </Badge>
                  )}
                  {vdpTransformed && (
                    <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> All Fixed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

            {/* ── Website-like VDP ── */}
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              {/* Browser chrome */}
              <div className="border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 bg-gray-50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white rounded-lg px-3 py-1.5 text-sm text-gray-400 font-mono truncate border">
                  {formData.dealerUrl || "https://dealer.example.com"}/inventory/{selectedCar.stockNo}
                </div>
              </div>

              {/* VDP Content */}
              <div className="bg-white p-6 text-gray-900">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Main image */}
                  <div className="lg:col-span-3">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                      {vdpTransformed ? (
                        <Image src={selectedCar.spynePhotos[currentPair] || PROC(1)} alt="Fixed" fill className="object-cover" />
                      ) : selectedCar.lotPhotos[currentPair] ? (
                        <Image src={selectedCar.lotPhotos[currentPair] || RAW(1)} alt="Current" fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <ImageOff className="h-12 w-12 text-gray-300" />
                          <span className="text-sm text-gray-400 mt-2">No photo available</span>
                        </div>
                      )}

                      {/* Issue pills on image */}
                      {!vdpTransformed && selectedCar.issues.length > 0 && (
                        <div className="absolute bottom-3 left-3 right-3 flex gap-2 flex-wrap">
                          {selectedCar.issues.slice(0, 3).map((issue, i) => (
                            <span key={i} className="bg-red-500/90 text-white text-xs px-2.5 py-1 rounded-full">{issue.label}</span>
                          ))}
                        </div>
                      )}

                      {vdpTransformed && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Listing Ready
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Thumbnails */}
                    <div className="grid grid-cols-6 gap-2 mt-3">
                      {(vdpTransformed ? selectedCar.spynePhotos : selectedCar.lotPhotos.length ? selectedCar.lotPhotos : selectedCar.spynePhotos).slice(0, 6).map((src, i) => (
                        <button key={i} onClick={() => setCurrentPair(i)}
                          className={cn("relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 ring-2 transition-all",
                            currentPair === i ? "ring-purple-500" : "ring-transparent hover:ring-gray-300")}>
                          <Image src={src} alt={`Thumb ${i + 1}`} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Info panel */}
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCar.year} {selectedCar.make} {selectedCar.model}</h2>
                      <p className="text-gray-500">{selectedCar.trim} · {selectedCar.color}</p>
                    </div>
                    <p className="text-3xl font-bold">${selectedCar.price.toLocaleString()}</p>
                    <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
                      <p>VIN: {selectedCar.vin}</p>
                      <p>Stock #: {selectedCar.stockNo}</p>
                      <p>Days on lot: {selectedCar.daysOnLot}</p>
                      <p>Holding cost: ${selectedCar.holdingCostPerDay * selectedCar.daysOnLot}</p>
                    </div>

                    {/* Issues list — BEFORE */}
                    {!vdpTransformed && selectedCar.issues.length > 0 && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4" />
                          {selectedCar.issues.length} listing issues detected
                        </p>
                        <ul className="mt-2 space-y-1.5">
                          {selectedCar.issues.map((issue, i) => (
                            <li key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                              <X className="h-3 w-3 mt-0.5 shrink-0" />
                              <span><strong>{issue.label}</strong> — {issue.detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Issues resolved — AFTER */}
                    {vdpTransformed && selectedCar.issues.length > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-green-700 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" /> All issues resolved
                        </p>
                        <ul className="mt-2 space-y-1.5">
                          {selectedCar.issues.map((issue, i) => (
                            <li key={i} className="text-xs text-green-600 flex items-start gap-1.5">
                              <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" />
                              <span><strong>{issue.fixLabel}</strong> <span className="text-green-500">({issue.fixMethod})</span></span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* No photos notice */}
                    {!vdpTransformed && selectedCar.category === "no-photos" && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-semibold text-purple-700 flex items-center gap-1.5">
                          <ImageOff className="h-4 w-4" /> No photos on file
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          This vehicle has been on the lot for {selectedCar.daysOnLot} days with zero images — completely invisible to online buyers.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Granular Analysis Section ── */}
            {!vdpTransformed && selectedCar.issues.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-400" />
                  <h3 className="text-lg font-semibold">Granular Analysis</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Quality Score */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 flex flex-col items-center gap-3">
                    <p className="text-sm text-gray-400 font-medium">Quality Score</p>
                    <ScoreRing score={qualityScore(selectedCar.issues)} />
                    <p className="text-xs text-gray-400 text-center">
                      {qualityScore(selectedCar.issues) < 50 ? "Below marketplace threshold" : "Needs improvement"}
                    </p>
                  </div>

                  {/* Issue Breakdown */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 md:col-span-2">
                    <p className="text-sm text-gray-400 font-medium mb-3">Issue Breakdown</p>
                    <div className="space-y-2">
                      {selectedCar.issues.map((issue, i) => (
                        <div key={i} className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border",
                          issue.severity === "high" ? "bg-red-500/5 border-red-500/15" : issue.severity === "medium" ? "bg-amber-500/5 border-amber-500/15" : "bg-gray-50 border-gray-200"
                        )}>
                          <AlertTriangle className={cn("h-4 w-4 mt-0.5 shrink-0",
                            issue.severity === "high" ? "text-red-400" : issue.severity === "medium" ? "text-amber-400" : "text-gray-400"
                          )} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">{issue.label}</p>
                              <Badge variant="outline" className={cn("text-[9px]",
                                issue.severity === "high" ? "border-red-500/30 text-red-600" : issue.severity === "medium" ? "border-amber-500/30 text-amber-600" : "border-gray-300 text-gray-400"
                              )}>{issue.severity}</Badge>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{issue.detail}</p>
                            <p className="text-xs text-purple-600 mt-1">Fix: {issue.fixLabel} ({issue.fixMethod})</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Holding cost impact */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-200">Holding cost for this vehicle</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">${selectedCar.holdingCostPerDay * selectedCar.daysOnLot}</p>
                    <p className="text-xs text-amber-600 mt-1">
                      ${selectedCar.holdingCostPerDay}/day × {selectedCar.daysOnLot} days on lot — every day without listing-ready images costs money
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── VDP Transform Button ── */}
            {!vdpTransformed && (
              <div className="space-y-3">
                <button onClick={startVdpTransform} disabled={vdpTransforming}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-80 py-4 text-lg font-bold text-white transition-all flex items-center justify-center gap-3">
                  {vdpTransforming ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Transforming this vehicle…</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      <span>Transform This Vehicle</span>
                    </>
                  )}
                </button>
                {vdpTransforming && (
                  <div className="w-full rounded-full h-2 bg-gray-200 overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      style={{ width: `${vdpTransformProgress}%` }} />
                  </div>
                )}

                {/* Fix steps animation */}
                {vdpTransforming && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {VDP_FIXES.map((item, i) => {
                      const done = i < vdpFixStep
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
                )}
              </div>
            )}

            {/* ── Post-transform: What was fixed ── */}
            {vdpTransformed && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                {/* Before / After slider */}
                {selectedCar.lotPhotos.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <h3 className="text-lg font-semibold">Before vs After</h3>
                    </div>
                    <div ref={containerRef} className="relative rounded-2xl overflow-hidden bg-gray-100 select-none cursor-ew-resize" style={{ aspectRatio: "16/7" }}
                      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchMove={handleTouchMove} onTouchEnd={handleMouseUp}>
                      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - dividerPos}% 0 0)` }}>
                        <Image src={selectedCar.lotPhotos[currentPair] || RAW(1)} alt="Before" fill className="object-cover" />
                        <div className="absolute bottom-4 left-4"><span className="bg-red-500/80 text-white text-sm px-4 py-2 rounded-full font-medium">Before</span></div>
                      </div>
                      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${dividerPos}%)` }}>
                        <Image src={selectedCar.spynePhotos[currentPair] || PROC(1)} alt="After" fill className="object-cover" />
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

                    {/* Pair thumbnails */}
                    {Math.min(selectedCar.lotPhotos.length, selectedCar.spynePhotos.length) > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {Array.from({ length: Math.min(selectedCar.lotPhotos.length, selectedCar.spynePhotos.length) }).map((_, i) => (
                          <button key={i} onClick={() => { setCurrentPair(i); setDividerPos(50) }}
                            className={cn("relative w-16 h-12 rounded-lg overflow-hidden shrink-0 ring-2 transition-all",
                              currentPair === i ? "ring-purple-500" : "ring-transparent opacity-50 hover:opacity-80")}>
                            <Image src={selectedCar.spynePhotos[i]} alt={`Pair ${i + 1}`} fill className="object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* What was fixed */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <h3 className="text-lg font-semibold text-green-600">What Was Transformed</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {VDP_FIXES.map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                        className="rounded-xl border border-green-500/20 bg-green-500/10 p-3">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-green-400" />
                          <CheckCircle2 className="h-3 w-3 text-green-400 ml-auto" />
                        </div>
                        <p className="text-xs font-medium mt-1 text-green-600">{item.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {selectedCar.issues.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedCar.issues.map((issue, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                          <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-green-600">{issue.fixLabel}</p>
                            <p className="text-xs text-gray-400 mt-0.5">was: {issue.label}</p>
                            <p className="text-xs text-purple-600/70 mt-0.5">Method: {issue.fixMethod}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Impact cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
                    <Clock className="h-5 w-5 text-green-400 mb-2" />
                    <p className="text-xs text-green-600">Processing time</p>
                    <div className="mt-1">
                      <span className="text-sm text-red-400 line-through mr-2">3–7 days</span>
                      <span className="text-2xl font-bold text-green-600">1.2 sec</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-5">
                    <DollarSign className="h-5 w-5 text-purple-400 mb-2" />
                    <p className="text-xs text-purple-600">Editing cost</p>
                    <div className="mt-1">
                      <span className="text-sm text-red-400 line-through mr-2">$300–$570</span>
                      <span className="text-2xl font-bold text-purple-600">$0</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">
                    <Sparkles className="h-5 w-5 text-blue-400 mb-2" />
                    <p className="text-xs text-blue-600">Quality score</p>
                    <div className="mt-1">
                      <span className="text-sm text-red-400 line-through mr-2">{qualityScore(selectedCar.issues)}/100</span>
                      <span className="text-2xl font-bold text-blue-600">94/100</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 p-8 text-center">
                  <p className="text-xl font-bold">This vehicle is now listing-ready.</p>
                  <p className="text-gray-500 mt-1">Studio-quality images, consistent backgrounds, all angles covered.</p>
                  <button onClick={handleBackToVlp}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-3 text-sm font-semibold text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to All Listings
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
