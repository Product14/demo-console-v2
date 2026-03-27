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
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  Eye,
  Globe,
  ImageOff,
  Layers,
  Loader2,
  Palette,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Sun,
  Target,
  Wand2,
  X,
  Zap,
} from "lucide-react"

/* ══════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════ */

type Phase = "setup" | "inventory" | "problems" | "fix" | "ready"
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
  { key: "problems", label: "Problems Found", sub: "Issues detected by AI" },
  { key: "fix", label: "The Fix", sub: "See the difference" },
  { key: "ready", label: "Ready to Sell", sub: "List it right now" },
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

const ISSUE_POOL: CarIssue[] = [
  { label: "Low quality images", detail: "Resolution below marketplace minimum standards", severity: "high", fixLabel: "Enhanced to HD quality" },
  { label: "Distracting background", detail: "Parking lot clutter visible behind vehicle", severity: "high", fixLabel: "Background replaced with studio finish" },
  { label: "Cut-off images", detail: "Vehicle partially cropped at frame edges", severity: "high", fixLabel: "Reframed with full vehicle visible" },
  { label: "Missing images", detail: "Key angles not captured — incomplete coverage", severity: "high", fixLabel: "Missing angles filled via Smart Match" },
  { label: "Inconsistent framing", detail: "Photos cropped differently across angles", severity: "medium", fixLabel: "Standardized to consistent composition" },
  { label: "Seasonality", detail: "Weather/season doesn't match current listing period", severity: "medium", fixLabel: "Background adjusted to current season" },
  { label: "Bad angles", detail: "Unflattering perspective reduces buyer interest", severity: "high", fixLabel: "Angle corrected from similar vehicle" },
  { label: "Watermarks", detail: "Third-party watermarks visible on images", severity: "medium", fixLabel: "Watermarks removed cleanly" },
  { label: "Unsightly dealer banners", detail: "Promotional overlays blocking vehicle view", severity: "high", fixLabel: "Banners removed, vehicle fully visible" },
  { label: "Lack of branding", detail: "No dealer identity on listing images", severity: "low", fixLabel: "Dealer branding applied consistently" },
  { label: "Inconsistent orientation", detail: "Mixed landscape and portrait shots", severity: "medium", fixLabel: "All images normalized to landscape" },
  { label: "Unoptimized dimensions", detail: "Images not formatted for marketplace specs", severity: "low", fixLabel: "Resized for all marketplace standards" },
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

/* ══════════════════════════════════════════════════════════════════
   INVENTORY GENERATOR
   ══════════════════════════════════════════════════════════════════ */

function pickIssues(idx: number, count: number): CarIssue[] {
  const result: CarIssue[] = []
  for (let j = 0; j < count; j++) {
    result.push({ ...ISSUE_POOL[(idx * 3 + j * 5) % ISSUE_POOL.length] })
  }
  return result
}

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

    let issues: CarIssue[]
    if (cat === "ready") {
      issues = []
    } else if (cat === "no-photos") {
      issues = [{ label: "No photos on file", detail: "Vehicle has zero images — invisible to online buyers", severity: "high", fixLabel: "Images added via Smart Match" }]
    } else {
      const issueCount = 2 + ((i * 3) % 4)
      issues = pickIssues(i, issueCount)
      if (cat === "vin-cloned") {
        issues.unshift({ label: "VIN-cloned images in use", detail: "Stock photos from a different vehicle — creates buyer mistrust", severity: "high", fixLabel: "Replaced with actual vehicle photos" })
      }
    }

    const rawCount = cat === "lot-photos" ? 3 + (i % 3) : cat === "vin-cloned" ? 2 + (i % 2) : 0
    const lotPhotos = Array.from({ length: rawCount }, (_, j) => RAW(((i * 3 + j) % 11) + 1))

    const vcCount = cat === "vin-cloned" ? 2 + (i % 2) : 0
    const vinClonedPhotos = Array.from({ length: vcCount }, (_, j) => RAW(((i * 7 + j + 5) % 11) + 1))

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
   COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export default function DemoConsoleV4Page() {
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

  /* ── Effects ── */
  useEffect(() => {
    if (phase === "problems" && activeIssues.length > 0) {
      setProblemStep(0)
      const timers = activeIssues.map((_, i) => setTimeout(() => setProblemStep(i + 1), 400 + i * 350))
      return () => timers.forEach(clearTimeout)
    }
  }, [phase, activeIssues])

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
              <p className="text-xs uppercase tracking-widest text-purple-400 mb-1">{formData.dealerName}</p>
              <h1 className="text-4xl font-bold tracking-tight leading-tight">
                From lot photo to live listing.<br />
                <span className="text-purple-400">Under 2 seconds.</span>
              </h1>
              <p className="text-gray-500 mt-2 text-lg">No photographer. No editor. No waiting.</p>
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
              {phase === "inventory" && !selectedCarId && (
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                                  onClick={() => setSelectedCarId(car.id)}
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
                                      {thumb ? (
                                        <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                          <Image src={thumb} alt={car.model} fill className="object-cover" />
                                          {!isCarDone(car) && noPhotos && (
                                            <div className="absolute inset-0 bg-purple-950/40 flex items-center justify-center">
                                              <ImageOff className="h-4 w-4 text-purple-600" />
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="w-16 h-11 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                                          <ImageOff className="h-4 w-4 text-gray-300" />
                                        </div>
                                      )}
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
                                      <Badge className={cn("text-xs", car.issues.some((is) => is.severity === "high") ? "bg-red-500/20 text-red-600 border-red-500/30" : "bg-amber-500/20 text-amber-600 border-amber-500/30")}>
                                        {car.issues.length} issue{car.issues.length !== 1 && "s"}
                                      </Badge>
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
                    <div className="rounded-2xl overflow-hidden border border-gray-200">
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
                      {/* SRP content */}
                      <div className="bg-gray-50 p-6 max-h-[700px] overflow-y-auto">
                        <p className="text-gray-900 text-xl font-bold mb-1">{formData.dealerName}</p>
                        <p className="text-gray-500 text-sm mb-5">{inventory.length} vehicles available</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {inventory.map((car) => {
                            const thumb = getThumb(car)
                            const noPhotos = car.category === "no-photos" && !isCarDone(car)
                            return (
                              <div key={car.id} onClick={() => setSelectedCarId(car.id)}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                                <div className="relative aspect-[4/3] bg-gray-100">
                                  {thumb && !noPhotos ? (
                                    <Image src={thumb} alt={car.model} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                  ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                                      <ImageOff className="h-8 w-8 text-gray-300" />
                                      <span className="text-xs text-gray-400 mt-2">No photo available</span>
                                    </div>
                                  )}
                                  {!isCarDone(car) && car.issues.length > 0 && (
                                    <div className="absolute top-2 right-2">
                                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                        {car.issues.length} issue{car.issues.length !== 1 && "s"}
                                      </span>
                                    </div>
                                  )}
                                  {!isCarDone(car) && car.hasVinCloned && (
                                    <div className="absolute top-2 left-2">
                                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium border border-red-200">
                                        VIN Cloned
                                      </span>
                                    </div>
                                  )}
                                  {isCarDone(car) && (
                                    <div className="absolute top-2 right-2">
                                      <CheckCircle2 className="h-5 w-5 text-green-500 drop-shadow" />
                                    </div>
                                  )}
                                </div>
                                <div className="p-3">
                                  <p className="font-semibold text-gray-900 text-sm">{car.year} {car.make} {car.model}</p>
                                  <p className="text-xs text-gray-400">{car.trim} · {car.color}</p>
                                  <p className="text-lg font-bold text-gray-900 mt-1">${car.price.toLocaleString()}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-400">{car.daysOnLot} days on lot</span>
                                    {isCarDone(car) ? (
                                      <span className="text-xs text-green-600 font-medium">Listing Ready</span>
                                    ) : (
                                      <span className={cn("text-xs font-medium", car.status === "ready" ? "text-green-600" : "text-amber-600")}>
                                        {car.status === "ready" ? "Ready" : "Needs Review"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transform CTA + Progress */}
                  {!transformed && (
                    <div className="space-y-3">
                      <button onClick={startTransform} disabled={transforming}
                        className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-80 py-4 text-lg font-bold text-white transition-all flex items-center justify-center gap-3">
                        {transforming ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>{TRANSFORM_LABELS[transformLabelIdx]}</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-5 w-5" />
                            <span>Transform All {inventory.length} Vehicles</span>
                          </>
                        )}
                      </button>
                      {transforming && (
                        <div className="w-full rounded-full h-2 bg-gray-200 overflow-hidden">
                          <motion.div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                            style={{ width: `${transformProgress}%` }}
                            transition={{ duration: 0.05 }} />
                        </div>
                      )}
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
                 1b. INVENTORY — car selected (TABLE detail)
                 ═══════════════════════════════════════════════ */}
              {phase === "inventory" && selectedCarId && selectedCar && viewMode === "table" && (
                <motion.div key="inv-detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <button onClick={() => setSelectedCarId(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                      <ArrowLeft className="h-4 w-4" /> Back to Inventory
                    </button>
                    <div className="flex items-center gap-2">
                      {!selectedCarDone && selectedCar.hasVinCloned && <Badge className="bg-red-500/20 text-red-600 border-red-500/30">VIN Cloned — Replace Now</Badge>}
                      {!selectedCarDone && selectedCar.category === "no-photos" && <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">No Photos — Smart Match</Badge>}
                      <Badge className={cn("text-xs", selectedCarDone ? "bg-green-500/20 text-green-600 border-green-500/30" : "bg-amber-500/20 text-amber-600 border-amber-500/30")}>
                        {selectedCarDone ? "Ready" : "Needs Review"}
                      </Badge>
                    </div>
                  </div>

                  {/* Car info header */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-xl font-bold">{carLabel} {selectedCar.trim}</p>
                      <p className="text-sm text-gray-400 mt-1">{selectedCar.color} · VIN: {selectedCar.vin} · Stock #{selectedCar.stockNo}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Days on lot</p>
                        <p className={cn("text-lg font-bold", selectedCar.daysOnLot >= 10 ? "text-red-600" : "text-gray-900")}>{selectedCar.daysOnLot}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Holding cost</p>
                        <p className="text-lg font-bold text-amber-600">${selectedCar.holdingCostPerDay * selectedCar.daysOnLot}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Issues</p>
                        <p className={cn("text-lg font-bold", selectedCarDone ? "text-green-600" : "text-red-600")}>{selectedCarDone ? 0 : selectedCar.issues.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* ── POST-TRANSFORM: all photos ready ── */}
                  {selectedCarDone && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <p className="text-sm font-semibold text-green-600 uppercase tracking-wider">All Photos — Listing Ready</p>
                        </div>
                        <div className="rounded-xl border border-green-500/20 bg-green-500/[0.04] p-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {(selectedCar.spynePhotos.length ? selectedCar.spynePhotos : selectedCar.smartMatchPhotos).map((src, i) => (
                              <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 ring-2 ring-green-500/20">
                                <Image src={src} alt={`Ready ${i + 1}`} fill className="object-cover" />
                                <div className="absolute top-2 right-2"><CheckCircle2 className="h-5 w-5 text-green-400 drop-shadow-lg" /></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {selectedCar.issues.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">What was fixed</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedCar.issues.map((issue, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-green-600">{issue.fixLabel}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">was: {issue.label}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── PRE-TRANSFORM: sections ── */}
                  {!selectedCarDone && (
                    <>
                      {/* No photos warning */}
                      {selectedCar.category === "no-photos" && (
                        <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.04] p-5 flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
                            <ImageOff className="h-6 w-6 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-purple-700">This vehicle has no photos on file</p>
                            <p className="text-sm text-purple-600/60 mt-1">
                              It&apos;s been {selectedCar.daysOnLot} day{selectedCar.daysOnLot !== 1 && "s"} on the lot with zero images —
                              completely invisible to online buyers.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Lot Photos */}
                      {selectedCar.lotPhotos.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Lot Photos</p>
                          </div>
                          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {selectedCar.lotPhotos.map((src, i) => {
                                const issue = selectedCar.issues.filter((is) => is.label !== "VIN-cloned images in use")[i]
                                return (
                                  <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                                    <Image src={src} alt={`Lot photo ${i + 1}`} fill className="object-cover" />
                                    {issue && (
                                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                        <div className="flex items-center gap-1">
                                          <AlertTriangle className={cn("h-3 w-3 shrink-0", issue.severity === "high" ? "text-red-400" : "text-amber-400")} />
                                          <span className={cn("text-xs truncate", issue.severity === "high" ? "text-red-700" : "text-amber-700")}>{issue.label}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* VIN Cloned */}
                      {selectedCar.hasVinCloned && selectedCar.vinClonedPhotos.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Copy className="h-4 w-4 text-red-400" />
                            <p className="text-sm font-semibold text-red-600 uppercase tracking-wider">VIN Cloned Images</p>
                            <Badge className="bg-red-500/20 text-red-600 border-red-500/30 text-xs">Mistrust Risk</Badge>
                          </div>
                          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4 space-y-3">
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-start gap-3">
                              <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                              <p className="text-sm text-red-700">These images are from a different vehicle — buyers can tell. This creates immediate mistrust and kills conversion.</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {selectedCar.vinClonedPhotos.map((src, i) => (
                                <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 ring-2 ring-red-500/30">
                                  <Image src={src} alt={`VIN cloned ${i + 1}`} fill className="object-cover" />
                                  <div className="absolute inset-0 bg-red-950/20" />
                                  <div className="absolute top-2 left-2"><Badge className="bg-red-600/90 text-white border-0 text-xs">Not actual vehicle</Badge></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Smart Match */}
                      {selectedCar.smartMatchPhotos.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-purple-400" />
                            <p className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Smart Match</p>
                            <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30 text-xs">AI-Matched</Badge>
                          </div>
                          <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.04] p-4 space-y-3">
                            <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-4 py-3 text-sm text-purple-700">
                              {selectedCar.smartMatchPhotos.length} images matched from similar {selectedCar.make} {selectedCar.model} vehicles.
                              Use these to get the car listed immediately.
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {selectedCar.smartMatchPhotos.map((src, i) => (
                                <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 ring-2 ring-purple-500/25">
                                  <Image src={src} alt={`Smart Match ${i + 1}`} fill className="object-cover" />
                                  <div className="absolute top-2 left-2"><Badge className="bg-purple-600/90 text-white border-0 text-xs">Similar vehicle</Badge></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Spyne Enhanced */}
                      {selectedCar.spynePhotos.length > 0 && selectedCar.category !== "ready" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-green-400" />
                            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider">Spyne Enhanced</p>
                            <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">Ready to Replace</Badge>
                          </div>
                          <div className="rounded-xl border border-green-500/20 bg-green-500/[0.04] p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {selectedCar.spynePhotos.map((src, i) => (
                                <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 ring-2 ring-green-500/20">
                                  <Image src={src} alt={`Enhanced ${i + 1}`} fill className="object-cover" />
                                  <div className="absolute top-2 right-2"><CheckCircle2 className="h-5 w-5 text-green-400 drop-shadow-lg" /></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Single-car transform CTA */}
                  {!selectedCarDone && (
                    <div className="space-y-3">
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
                    </div>
                  )}

                  {/* CTA bar */}
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 flex-wrap gap-3">
                    <p className="text-sm text-gray-500">
                      {selectedCarDone
                        ? "All issues fixed — this vehicle is listing-ready"
                        : `${selectedCar.issues.length} issue${selectedCar.issues.length !== 1 ? "s" : ""} found`}
                    </p>
                    <button onClick={next}
                      className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors">
                      {selectedCarDone ? "View before / after" : selectedCar.lotPhotos.length > 0 ? "See detailed problems" : "See Smart Match preview"}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════
                 1c. INVENTORY — car selected (WEBSITE VDP)
                 ═══════════════════════════════════════════════ */}
              {phase === "inventory" && selectedCarId && selectedCar && viewMode === "website" && (
                <motion.div key="vdp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="rounded-2xl overflow-hidden border border-gray-200">
                    {/* Browser chrome */}
                    <div className="border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 bg-gray-50">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 bg-white rounded-lg px-3 py-1.5 text-sm text-gray-400 font-mono truncate border">
                        {formData.dealerUrl}/inventory/{selectedCar.stockNo}
                      </div>
                    </div>
                    {/* VDP content */}
                    <div className="bg-white p-6 text-gray-900">
                      <button onClick={() => setSelectedCarId(null)} className="text-blue-600 text-sm mb-5 flex items-center gap-1 hover:underline">
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Search Results
                      </button>
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Gallery */}
                        <div className="lg:col-span-3">
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                            {getThumb(selectedCar) ? (
                              <Image src={getThumb(selectedCar)} alt={carLabel} fill className="object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center"><ImageOff className="h-12 w-12 text-gray-300" /></div>
                            )}
                            {!selectedCarDone && selectedCar.issues.length > 0 && (
                              <div className="absolute bottom-3 left-3 right-3 flex gap-2 flex-wrap">
                                {selectedCar.issues.slice(0, 3).map((issue, i) => (
                                  <span key={i} className="bg-red-500/90 text-white text-xs px-2.5 py-1 rounded-full">{issue.label}</span>
                                ))}
                              </div>
                            )}
                            {selectedCarDone && (
                              <div className="absolute top-3 right-3">
                                <span className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Listing Ready
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Thumbnails */}
                          <div className="grid grid-cols-6 gap-2 mt-3">
                            {(selectedCarDone ? (selectedCar.spynePhotos.length ? selectedCar.spynePhotos : selectedCar.smartMatchPhotos) : selectedCar.lotPhotos.length ? selectedCar.lotPhotos : selectedCar.vinClonedPhotos).slice(0, 6).map((src, i) => (
                              <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                                <Image src={src} alt={`Thumb ${i + 1}`} fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Info panel */}
                        <div className="lg:col-span-2 space-y-4">
                          <div>
                            <h2 className="text-2xl font-bold">{carLabel}</h2>
                            <p className="text-gray-500">{selectedCar.trim} · {selectedCar.color}</p>
                          </div>
                          <p className="text-3xl font-bold">${selectedCar.price.toLocaleString()}</p>
                          <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
                            <p>VIN: {selectedCar.vin}</p>
                            <p>Stock #: {selectedCar.stockNo}</p>
                            <p>Days on lot: {selectedCar.daysOnLot}</p>
                          </div>
                          {!selectedCarDone && selectedCar.issues.length > 0 && (
                            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                              <p className="text-sm font-medium text-red-700">{selectedCar.issues.length} listing issues detected</p>
                              <ul className="mt-2 space-y-1">
                                {selectedCar.issues.map((issue, i) => (
                                  <li key={i} className="text-xs text-red-600 flex items-center gap-1.5">
                                    <X className="h-3 w-3" />{issue.label}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {selectedCarDone && (
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm font-medium text-green-700 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> All issues resolved</p>
                              <ul className="mt-2 space-y-1">
                                {selectedCar.issues.map((issue, i) => (
                                  <li key={i} className="text-xs text-green-600 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3 w-3" />{issue.fixLabel}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {!selectedCarDone && (
                            <button onClick={() => startSingleTransform(selectedCar.id)} disabled={transforming}
                              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-80 text-white py-3 text-sm font-bold transition-all flex items-center justify-center gap-2">
                              {isTransformingSelected ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /><span>{TRANSFORM_LABELS[transformLabelIdx]}</span></>
                              ) : (
                                <><Wand2 className="h-4 w-4" /><span>Transform This Vehicle</span></>
                              )}
                            </button>
                          )}
                          <button onClick={() => { goTo("problems") }}
                            className="w-full rounded-lg bg-purple-600 hover:bg-purple-500 text-white py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                            {selectedCarDone ? "View before / after" : "Analyze this vehicle"} <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════
                 2. PROBLEMS FOUND
                 ═══════════════════════════════════════════════ */}
              {phase === "problems" && (
                <motion.div key="problems" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <p className="text-gray-500 text-lg">
                    Here&apos;s what&apos;s keeping your <span className="text-gray-900 font-medium">{carLabel}</span> from selling online.
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
                      <div className="relative aspect-video bg-gray-100">
                        <Image src={activeLotPhotos[0]} alt="Vehicle photo" fill className="object-cover" />
                        {problemStep >= 1 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        )}
                        {problemStep >= Math.min(3, activeIssues.length) && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                            <span className="bg-red-500/90 text-white text-sm px-4 py-2 rounded-full font-medium">{activeIssues.length} problem{activeIssues.length !== 1 && "s"} found</span>
                            <span className="bg-white/20 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">Quality: {score}/100</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">What buyers notice</p>
                      <div className="space-y-3">
                        {activeIssues.map((issue, i) => (
                          <motion.div key={i}
                            initial={{ opacity: 0, x: -15 }}
                            animate={i < problemStep ? { opacity: 1, x: 0 } : { opacity: 0, x: -15 }}
                            transition={{ duration: 0.3 }}
                            className={cn("flex items-start gap-3 p-3 rounded-xl border", issue.severity === "high" ? "bg-red-500/5 border-red-500/10" : "bg-amber-500/5 border-amber-500/10")}>
                            <X className={cn("h-4 w-4 mt-0.5 shrink-0", issue.severity === "high" ? "text-red-400" : "text-amber-400")} />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{issue.label}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{issue.detail}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                  {problemStep >= activeIssues.length && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
                      {!selectedCarDone && selectedCar && (
                        <button onClick={() => startSingleTransform(selectedCar.id)} disabled={transforming}
                          className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-80 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2">
                          {isTransformingSelected ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /><span>{TRANSFORM_LABELS[transformLabelIdx]}</span></>
                          ) : (
                            <><Wand2 className="h-4 w-4" /><span>Transform This Vehicle</span></>
                          )}
                        </button>
                      )}
                      {isTransformingSelected && (
                        <div className="w-full rounded-full h-1.5 bg-gray-200 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-75" style={{ width: `${transformProgress}%` }} />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => goTo("inventory")} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium hover:bg-gray-100 transition-colors">Back</button>
                        <button onClick={next} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-3 text-sm font-semibold text-white transition-colors">
                          {selectedCarDone ? "See the result" : "Fix all of this"} <Wand2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════
                 3. THE FIX
                 ═══════════════════════════════════════════════ */}
              {phase === "fix" && (
                <motion.div key="fix" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
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
                      {selectedCarDone && (
                        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-5 py-3">
                          <p className="text-sm text-gray-500">All 6 fixes applied automatically. <span className="text-gray-900 font-semibold">Total time: 1.2 seconds.</span></p>
                          <button onClick={next} className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors">
                            See the result <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════
                 4. READY TO SELL
                 ═══════════════════════════════════════════════ */}
              {phase === "ready" && (
                <motion.div key="ready" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <p className="text-gray-500 text-lg">
                    Your <span className="text-gray-900 font-medium">{carLabel}</span> is ready to list. Right now.
                  </p>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {activeProcessed.map((src, i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                          className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                          <Image src={src} alt={`Ready ${i + 1}`} fill className="object-cover" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
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
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="rounded-2xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 p-8 text-center">
                    <p className="text-2xl font-bold text-gray-900">This car went from lot to listing-ready in under 2 seconds.</p>
                    <p className="text-gray-500 mt-2 text-lg">No photographer needed. No editing team. No days of waiting.</p>
                    <button onClick={() => { goTo("inventory"); setSelectedCarId(null) }}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-3 text-sm font-semibold text-white transition-colors">
                      <Play className="h-4 w-4" /> Back to Inventory
                    </button>
                  </motion.div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  )
}
