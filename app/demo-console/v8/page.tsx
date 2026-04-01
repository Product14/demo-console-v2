"use client"

import { useState, useMemo, useCallback, useLayoutEffect, useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { CheckCircle2, ChevronRight } from "lucide-react"
import { HoldingCostTicker } from "./components/holding-cost-ticker"
import { SetupSection } from "./sections/setup"
import { InventorySection } from "./sections/inventory"
import { VehicleXRaySection } from "./sections/vehicle-xray"
import { TransformSection } from "./sections/transform"
import { GoLiveSection } from "./sections/go-live"
import { ImpactSection } from "./sections/impact"
import { ImageLightboxProvider } from "./components/image-lightbox"
import { resolveAeKit, V8_DEMO_STORAGE_KEY } from "./ae-demo-kit"

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

export type Phase = "setup" | "inventory" | "xray" | "transform" | "golive" | "impact"
export type ViewMode = "table" | "website"
export type CarCategory = "lot-photos" | "vin-cloned" | "no-photos" | "ready"

export interface FormData {
  dealerName: string
  dealerUrl: string
  rooftops: string
  monthlyCars: string
  avgDaysOnLot: string
  holdingCostPerDay: string
  fullImageSetPct: string
  photoWorkflow: string
}

export interface CarIssue {
  label: string
  detail: string
  severity: "high" | "medium" | "low"
  fixLabel: string
  aiModel?: string
}

export interface InventoryCar {
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

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

const STEPS: Array<{ key: Phase; label: string; sub: string }> = [
  { key: "inventory", label: "Inventory Audit", sub: "What buyers see today" },
  { key: "xray", label: "X-Ray", sub: "AI diagnosis" },
  { key: "transform", label: "Transform", sub: "Watch the AI work" },
  { key: "golive", label: "Go Live", sub: "Publish everywhere" },
  { key: "impact", label: "Impact", sub: "ROI & next steps" },
]

export const RAW = (n: number) =>
  `/demo-console/raw/raw-${String(n).padStart(2, "0")}.png`
export const PROC = (n: number) =>
  `/demo-console/processed/processed-${String(n).padStart(2, "0")}.png`

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

const RAW_ISSUE_MAP: Record<number, CarIssue> = {
  2: { label: "Low quality images", detail: "Resolution below marketplace minimum standards", severity: "high", fixLabel: "Enhanced to HD quality", aiModel: "super res" },
  3: { label: "Distracting background", detail: "Parking lot clutter visible behind vehicle", severity: "high", fixLabel: "Background replaced with studio finish", aiModel: "remove bg car exterior" },
  4: { label: "Inconsistent framing", detail: "Photos cropped differently across angles", severity: "medium", fixLabel: "Standardized to consistent composition", aiModel: "tilt correction" },
  5: { label: "Cut-off images", detail: "Vehicle partially cropped at frame edges", severity: "high", fixLabel: "Reframed with full vehicle visible", aiModel: "uncrop car" },
  6: { label: "Seasonality", detail: "Weather/season doesn't match current listing period", severity: "medium", fixLabel: "Background adjusted to current season", aiModel: "replace car bg" },
  7: { label: "Bad angles", detail: "Unflattering perspective reduces buyer interest", severity: "high", fixLabel: "Angle corrected from similar vehicle", aiModel: "angle classifier" },
  8: { label: "Watermarks", detail: "Third-party watermarks visible on images", severity: "medium", fixLabel: "Watermarks removed cleanly", aiModel: "watermark removal" },
  9: { label: "Unsightly dealer banners", detail: "Promotional overlays blocking vehicle view", severity: "high", fixLabel: "Banners removed, vehicle fully visible", aiModel: "banner remove bg" },
  10: { label: "Lack of branding", detail: "No dealer identity on listing images", severity: "low", fixLabel: "Dealer branding applied consistently", aiModel: "logo effect" },
}

function issueForRaw(src: string): CarIssue | null {
  const m = src.match(/raw-(\d+)/)
  if (!m) return null
  return RAW_ISSUE_MAP[parseInt(m[1])] ?? null
}

export function qualityScore(issues: CarIssue[]): number {
  let s = 92
  for (const issue of issues) {
    if (issue.severity === "high") s -= 14
    else if (issue.severity === "medium") s -= 8
    else s -= 4
  }
  return Math.max(18, s)
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

    const rawCount = cat === "lot-photos" ? 3 + (i % 3) : cat === "vin-cloned" ? 2 + (i % 2) : 0
    const lotPhotos = Array.from({ length: rawCount }, (_, j) => RAW(((i * 3 + j) % 9) + 2))
    const vcCount = cat === "vin-cloned" ? 2 + (i % 2) : 0
    const vinClonedPhotos = Array.from({ length: vcCount }, (_, j) => RAW(((i * 7 + j + 5) % 9) + 2))

    let issues: CarIssue[]
    if (cat === "ready") {
      issues = []
    } else if (cat === "no-photos") {
      issues = [{ label: "No photos on file", detail: "Vehicle has zero images — invisible to online buyers", severity: "high", fixLabel: "Images added via Smart Match", aiModel: "smart match" }]
    } else {
      const seen = new Set<string>()
      issues = lotPhotos.map(src => issueForRaw(src)).filter((x): x is CarIssue => {
        if (!x || seen.has(x.label)) return false
        seen.add(x.label)
        return true
      })
      if (cat === "vin-cloned") {
        issues.unshift({ label: "VIN-cloned images in use", detail: "Stock photos from a different vehicle — creates buyer mistrust", severity: "high", fixLabel: "Replaced with actual vehicle photos", aiModel: "feature extraction" })
      }
    }

    const spCount = cat === "ready" ? 4 + (i % 3) : cat !== "no-photos" ? 2 + (i % 3) : 0
    const spynePhotos = Array.from({ length: spCount }, (_, j) => PROC(((i * 2 + j) % 8) + 1))
    const smCount = cat === "no-photos" ? 3 + (i % 2) : 0
    const smartMatchPhotos = Array.from({ length: smCount }, (_, j) => PROC(((i * 5 + j) % 8) + 1))

    cars.push({
      id: `inv-${i}`, stockNo, year, make: mm.make, model: mm.model, trim, color,
      vin, daysOnLot, price, lotPhotos, vinClonedPhotos, spynePhotos, smartMatchPhotos,
      issues, hasVinCloned: cat === "vin-cloned",
      status: cat === "ready" ? "ready" : "needs-review",
      holdingCostPerDay: holdingCost, category: cat,
    })
  }
  return cars
}

export const PUBLISH_CHANNELS = [
  { id: "website", label: "Your Website", desc: "Direct dealer site", comingSoon: false },
  { id: "autotrader", label: "AutoTrader", desc: "High-intent buyers", comingSoon: true },
  { id: "cargurus", label: "CarGurus", desc: "Deal rating platform", comingSoon: true },
  { id: "carscom", label: "Cars.com", desc: "Largest marketplace", comingSoon: true },
  { id: "facebook", label: "Facebook", desc: "Social marketplace", comingSoon: true },
  { id: "google", label: "Google VLA", desc: "Vehicle listing ads", comingSoon: true },
]

export const CAMPAIGN_TYPES = ["Price Drop", "New Arrival", "CPO Certified", "Clearance"]

export const OBJECTION_SNIPPETS = [
  { objection: "We already have a photographer", response: "Spyne doesn't replace your photographer — it accelerates their output, ensures consistency across locations, and fills gaps when they can't cover every vehicle.", whatToSay: "How many vehicles does your photographer cover per day? We typically help teams 3x that throughput without changing workflow." },
  { objection: "Budget is locked this quarter", response: "The ROI on listing-ready time alone typically pays for Spyne within the first month. Every day a vehicle sits without proper photos costs $40-50 in holding costs.", whatToSay: "What if I could show you how Spyne pays for itself in 30 days based on your current holding costs?" },
  { objection: "We tried AI photo tools before", response: "Most tools do one thing — background removal or enhancement. Spyne is the only platform that handles the entire merchandising pipeline: shoot, edit, publish, and optimize.", whatToSay: "Which tool did you use? I'd love to show you the specific gaps Spyne fills that others can't." },
  { objection: "Our images look fine", response: "Fine doesn't win the click. In marketplace rankings, listing quality directly affects visibility. The jump from 'fine' to 'great' is the difference between page 1 and page 3.", whatToSay: "Let me run a quick quality score on your top 10 listings — I think you'll be surprised at what the data shows." },
]

export const PHOTO_WORKFLOWS = ["in-house", "agency", "mixed", "unknown"]

type V8Persisted = {
  v: 1
  savedAt: number
  formData: FormData
  phase: Phase
  selectedCarId: string | null
  transformed: boolean
  transformedIds: string[]
  beforeStateRevealed: boolean
  holdingCostStopped: boolean
}

function parsePersisted(raw: string | null): V8Persisted | null {
  if (!raw) return null
  try {
    const p = JSON.parse(raw) as V8Persisted
    if (p?.v !== 1 || !p.formData || !p.phase) return null
    return p
  } catch {
    return null
  }
}

/* ═══════════════════════════════════════════════════════════════════
   ORCHESTRATOR
   ═══════════════════════════════════════════════════════════════════ */

function DemoConsoleV8Inner() {
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

  const [phase, setPhase] = useState<Phase>("setup")
  const [inventory, setInventory] = useState<InventoryCar[]>([])
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null)
  const [demoStartTime, setDemoStartTime] = useState<number | null>(null)
  const [holdingCostStopped, setHoldingCostStopped] = useState(false)
  const [transformed, setTransformed] = useState(false)
  const [transformedIds, setTransformedIds] = useState<Set<string>>(new Set())
  /** Until true, inventory audit hides diagnostic “before” state (issues, scores, flags). */
  const [beforeStateRevealed, setBeforeStateRevealed] = useState(false)

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const aeKit = useMemo(() => resolveAeKit(searchParams.get("ae")), [searchParams])

  const [resumeMeta, setResumeMeta] = useState<{ savedAt: number } | null>(null)

  useEffect(() => {
    const p = parsePersisted(localStorage.getItem(V8_DEMO_STORAGE_KEY(aeKit.id)))
    if (p && p.phase !== "setup") setResumeMeta({ savedAt: p.savedAt })
    else setResumeMeta(null)
  }, [aeKit.id])

  useEffect(() => {
    if (phase === "setup") return
    const payload: V8Persisted = {
      v: 1,
      savedAt: Date.now(),
      formData,
      phase,
      selectedCarId,
      transformed,
      transformedIds: Array.from(transformedIds),
      beforeStateRevealed,
      holdingCostStopped,
    }
    localStorage.setItem(V8_DEMO_STORAGE_KEY(aeKit.id), JSON.stringify(payload))
  }, [
    phase,
    formData,
    selectedCarId,
    transformed,
    transformedIds,
    beforeStateRevealed,
    holdingCostStopped,
    aeKit.id,
  ])

  useLayoutEffect(() => {
    if (!pathname?.startsWith("/demo-console/v8")) return
    const main = document.querySelector("main.flex-1.min-h-0.overflow-y-auto") as HTMLElement | null
    if (main) main.scrollTop = 0
  }, [pathname, phase])

  const selectedCar = useMemo(
    () => inventory.find((c) => c.id === selectedCarId) ?? null,
    [inventory, selectedCarId]
  )

  const monthlyCars = Number(formData.monthlyCars) || 420
  const hcPerDay = Number(formData.holdingCostPerDay) || 45
  const fullPct = Number(formData.fullImageSetPct) || 58

  const totalIssues = useMemo(() => inventory.reduce((s, c) => s + c.issues.length, 0), [inventory])
  const vinClonedCount = useMemo(() => inventory.filter((c) => c.hasVinCloned).length, [inventory])
  const noPhotosCount = useMemo(() => inventory.filter((c) => c.category === "no-photos").length, [inventory])

  const isCarDone = useCallback(
    (car: InventoryCar) => transformed || transformedIds.has(car.id) || car.status === "ready",
    [transformed, transformedIds]
  )

  const phaseIndex = STEPS.findIndex((s) => s.key === phase)

  const handleResumeDemo = useCallback(() => {
    const p = parsePersisted(localStorage.getItem(V8_DEMO_STORAGE_KEY(aeKit.id)))
    if (!p || p.phase === "setup") return

    const inv = buildInventory(p.formData)
    setFormData(p.formData)
    setInventory(inv)

    let carId = p.selectedCarId
    const needsCar =
      p.phase === "xray" || p.phase === "transform" || p.phase === "golive"
    if (needsCar && (!carId || !inv.some((c) => c.id === carId))) {
      const first = inv.find((c) => c.status !== "ready") ?? inv[0] ?? null
      carId = first?.id ?? null
    }
    setSelectedCarId(carId)

    setTransformed(p.transformed)
    setTransformedIds(new Set(p.transformedIds))
    setBeforeStateRevealed(p.beforeStateRevealed)
    setHoldingCostStopped(p.holdingCostStopped)
    setDemoStartTime(Date.now())
    setPhase(p.phase)
  }, [aeKit.id])

  function handleSetup() {
    const inv = buildInventory(formData)
    setInventory(inv)
    setDemoStartTime(Date.now())
    setTransformed(false)
    setTransformedIds(new Set())
    setBeforeStateRevealed(false)
    setPhase("inventory")
  }

  function goTo(target: Phase) {
    if (target === "xray") {
      const current = inventory.find((c) => c.id === selectedCarId)
      if (!selectedCarId || !current || current.category === "ready") {
        const first = inventory.find((c) => c.status !== "ready")
        if (first) setSelectedCarId(first.id)
      }
    }
    setPhase(target)
  }

  function handleSelectCar(carId: string) {
    const car = inventory.find((c) => c.id === carId)
    if (car && car.category === "ready") {
      const first = inventory.find((c) => c.status !== "ready")
      if (first) setSelectedCarId(first.id)
    } else {
      setSelectedCarId(carId)
    }
    setPhase("xray")
  }

  function handleTransformSingle(carId: string) {
    setTransformedIds((prev) => new Set(prev).add(carId))
  }

  function handleTransformAll() {
    setTransformed(true)
  }

  function handlePublish() {
    setHoldingCostStopped(true)
    setTimeout(() => goTo("impact"), 800)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header (hidden during setup) */}
      {phase !== "setup" && (
        <div className="border-b border-gray-200 sticky top-0 z-30 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#6C47FF]" />
              <span className="font-bold text-sm">spyne</span>
              <span className="text-gray-300 mx-2">|</span>
              <span className="text-sm text-gray-500">{formData.dealerName}</span>
            </div>
            <HoldingCostTicker
              startTime={demoStartTime}
              stopped={holdingCostStopped}
              monthlyCars={monthlyCars}
              holdingCostPerDay={hcPerDay}
            />
          </div>
        </div>
      )}

      {/* Stepper (hidden during setup) */}
      {phase !== "setup" && (
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center gap-1">
              {STEPS.map((step, i) => {
                const isActive = phase === step.key
                const isPast = phaseIndex > i
                return (
                  <div key={step.key} className="flex items-center flex-1 min-w-0">
                    <button
                      onClick={() => goTo(step.key)}
                      className={cn(
                        "flex-1 flex items-center gap-3 rounded-xl px-4 py-3 transition-all",
                        isActive && "bg-purple-500/20 ring-1 ring-purple-500/40",
                        isPast && !isActive && "opacity-60 hover:opacity-80",
                        !isPast && !isActive && "opacity-30",
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                          isActive ? "bg-purple-500 text-white" : isPast ? "bg-green-500/80 text-white" : "bg-gray-200 text-gray-400",
                        )}
                      >
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
      )}

      {/* Hero tagline (shown after setup, before impact) */}
      {phase !== "setup" && phase !== "impact" && (
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
      )}

      {/* Phase content */}
      <div className={phase === "setup" ? "" : "max-w-7xl mx-auto px-6 py-8"}>
        <AnimatePresence mode="wait">
          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
              <SetupSection
                formData={formData}
                setFormData={setFormData}
                onStart={handleSetup}
                aeKit={aeKit}
                resumeAvailable={resumeMeta !== null}
                resumeSavedAt={resumeMeta?.savedAt ?? null}
                onResumeDemo={handleResumeDemo}
              />
            </motion.div>
          )}

          {phase === "inventory" && (
            <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <InventorySection
                inventory={inventory}
                formData={formData}
                isCarDone={isCarDone}
                transformed={transformed}
                beforeStateRevealed={beforeStateRevealed}
                onSelectCar={handleSelectCar}
                onAnalyseInventory={() => setBeforeStateRevealed(true)}
                onTransformAll={handleTransformAll}
              />
            </motion.div>
          )}

          {phase === "xray" && selectedCar && (
            <motion.div key="xray" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <VehicleXRaySection
                car={selectedCar}
                onBack={() => goTo("inventory")}
                onTransform={() => goTo("transform")}
              />
            </motion.div>
          )}

          {phase === "transform" && (
            <motion.div key="transform" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <TransformSection
                selectedCar={selectedCar}
                inventory={inventory}
                transformed={transformed}
                transformedIds={transformedIds}
                isCarDone={isCarDone}
                onTransformSingle={handleTransformSingle}
                onTransformAll={handleTransformAll}
                onGoLive={() => goTo("golive")}
              />
            </motion.div>
          )}

          {phase === "golive" && (
            <motion.div key="golive" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <GoLiveSection
                formData={formData}
                inventory={inventory}
                selectedCar={selectedCar}
                isCarDone={isCarDone}
                onPublish={handlePublish}
              />
            </motion.div>
          )}

          {phase === "impact" && (
            <motion.div key="impact" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <ImpactSection
                formData={formData}
                inventory={inventory}
                totalIssues={totalIssues}
                vinClonedCount={vinClonedCount}
                noPhotosCount={noPhotosCount}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function DemoConsoleV8Page() {
  return (
    <ImageLightboxProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-white flex items-center justify-center px-6">
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <div className="h-5 w-5 rounded bg-[#6C47FF] opacity-80 animate-pulse" />
              Loading demo…
            </div>
          </div>
        }
      >
        <DemoConsoleV8Inner />
      </Suspense>
    </ImageLightboxProvider>
  )
}
