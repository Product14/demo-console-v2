"use client"

import { useState } from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  Award, Camera, CheckCircle2, ChevronRight, CreditCard, Globe, ImageOff, Play, QrCode, RotateCcw, Search,
  Settings2, Shield, Sparkles, Stamp, Type, Video, Wand2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ScoreRing } from "../components/score-ring"
import { useImageLightbox, type GalleryItem } from "../components/image-lightbox"
import type { InventoryCar, FormData, CarCategory, CarIssue } from "../page"
import { RAW, PROC, qualityScore } from "../page"

/** Literal paths avoid calling PROC() at module scope (circular import with page.tsx). */
const STUDIO_BG_GALLERY_ITEMS: GalleryItem[] = [
  { src: "/demo-console/processed/processed-01.png", alt: "Studio White" },
  { src: "/demo-console/processed/processed-02.png", alt: "Showroom floor" },
  { src: "/demo-console/processed/processed-03.png", alt: "Outdoor lot" },
  { src: "/demo-console/processed/processed-04.png", alt: "Dark studio" },
  { src: "/demo-console/processed/processed-05.png", alt: "Premium studio" },
  { src: "/demo-console/processed/processed-06.png", alt: "LED ramp" },
  { src: "/demo-console/processed/processed-07.png", alt: "Neutral gray" },
  { src: "/demo-console/processed/processed-08.png", alt: "Luxury backdrop" },
]

type ViewMode = "table" | "website"
type Filter = "all" | CarCategory

function IssueTooltipChip({ issue }: { issue: CarIssue }) {
  const sev =
    issue.severity === "high"
      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      : issue.severity === "medium"
        ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
        : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"

  return (
    <TooltipPrimitive.Root>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "max-w-[140px] truncate rounded-full border px-2 py-0.5 text-left text-[10px] font-semibold transition-colors",
            sev
          )}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {issue.label}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className="max-w-xs text-left font-normal">
        <p className="font-semibold text-primary-foreground">{issue.label}</p>
        <p className="mt-1 text-primary-foreground/90">{issue.detail}</p>
        {issue.aiModel && (
          <p className="mt-2 text-[10px] text-primary-foreground/80">
            AI fix: <span className="font-medium">{issue.aiModel}</span>
          </p>
        )}
        <p className="mt-1 text-[10px] text-primary-foreground/80">{issue.fixLabel}</p>
      </TooltipContent>
    </TooltipPrimitive.Root>
  )
}

export function InventorySection({
  inventory,
  formData,
  isCarDone,
  transformed,
  beforeStateRevealed,
  onSelectCar,
  onAnalyseInventory,
  onTransformAll,
}: {
  inventory: InventoryCar[]
  formData: FormData
  isCarDone: (car: InventoryCar) => boolean
  transformed: boolean
  beforeStateRevealed: boolean
  onSelectCar: (carId: string) => void
  onAnalyseInventory: () => void
  onTransformAll: () => void
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [filter, setFilter] = useState<Filter>("all")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<"studio" | "mediakit">("studio")
  const [selectedBg, setSelectedBg] = useState(0)
  const [numberplateMasking, setNumberplateMasking] = useState(false)
  const [selectedVideoTemplate, setSelectedVideoTemplate] = useState(0)
  const [activeProducts, setActiveProducts] = useState<Set<string>>(new Set(["images", "360spin", "videotour"]))
  const [activeMediaKitAssets, setActiveMediaKitAssets] = useState<Set<string>>(new Set(["watermark", "tagline"]))

  const { openImage, openGallery } = useImageLightbox()

  const totalIssues = inventory.reduce((s, c) => s + (isCarDone(c) ? 0 : c.issues.length), 0)
  const vinClonedCount = inventory.filter((c) => c.hasVinCloned && !isCarDone(c)).length
  const noPhotosCount = inventory.filter((c) => c.category === "no-photos" && !isCarDone(c)).length
  const avgScore = Math.round(
    inventory.reduce((s, c) => s + qualityScore(isCarDone(c) ? [] : c.issues), 0) / Math.max(1, inventory.length)
  )

  const filtered = filter === "all" ? inventory : inventory.filter((c) => c.category === filter)

  const diagnosticsVisible = beforeStateRevealed || transformed

  function getThumb(car: InventoryCar): string {
    if (isCarDone(car)) return car.spynePhotos[0] || car.smartMatchPhotos[0] || `/demo-console/processed/processed-09.png`
    return car.lotPhotos[0] || car.vinClonedPhotos[0] || ""
  }

  function photoGalleryItemsForCar(car: InventoryCar): GalleryItem[] {
    const title = `${car.year} ${car.make} ${car.model}`
    const done = isCarDone(car)
    const urls: string[] = done
      ? [...car.spynePhotos, ...car.smartMatchPhotos]
      : [...car.lotPhotos, ...car.vinClonedPhotos]
    const seen = new Set<string>()
    const items: GalleryItem[] = []
    let n = 0
    for (const src of urls) {
      if (!src || seen.has(src)) continue
      seen.add(src)
      n += 1
      items.push({ src, alt: `${title} · photo ${n}` })
    }
    if (items.length === 0) {
      const t = getThumb(car)
      if (t) items.push({ src: t, alt: title })
    }
    return items
  }

  return (
    <TooltipProvider delayDuration={200}>
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Active Listings", value: inventory.length, sub: "vehicles", color: "border-gray-200 bg-gray-50" },
          { label: "Issues Found", value: totalIssues, sub: "each costs visibility", color: "border-amber-500/20 bg-amber-500/5", valueColor: "text-amber-600" },
          { label: "VIN-Cloned", value: vinClonedCount, sub: "buyer mistrust risk", color: "border-red-500/20 bg-red-500/5", valueColor: "text-red-600" },
          { label: "Invisible", value: noPhotosCount, sub: "in stock, not live", color: "border-purple-500/20 bg-purple-500/5", valueColor: "text-purple-600" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("rounded-xl border p-4", card.color)}
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={cn("text-3xl font-bold mt-1", card.valueColor || "text-gray-900")}>
              {card.label === "Active Listings"
                ? card.value
                : transformed
                  ? 0
                  : diagnosticsVisible
                    ? card.value
                    : "—"}
            </p>
            {transformed && card.label !== "Active Listings" && (
              <p className="text-xs text-green-500 mt-0.5">All fixed</p>
            )}
            {!transformed && !diagnosticsVisible && card.label !== "Active Listings" && (
              <p className="text-xs text-gray-400 mt-0.5">Run Analyse inventory</p>
            )}
            <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center gap-3"
        >
          {transformed || diagnosticsVisible ? (
            <ScoreRing
              value={transformed ? 94 : avgScore}
              size={48}
              stroke={4}
              color={transformed ? "text-green-500" : "text-amber-500"}
            />
          ) : (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-200 text-lg font-bold text-gray-300"
              aria-hidden
            >
              —
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Media Score</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {transformed ? "Excellent" : diagnosticsVisible ? "Needs work" : "Not analysed yet"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Toolbar + Studio Configuration (panel sits directly under actions) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-all", viewMode === "table" ? "bg-purple-500 text-white" : "text-gray-500 hover:text-gray-600")}
              >
                Inventory
              </button>
              <button
                type="button"
                onClick={() => setViewMode("website")}
                className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-all", viewMode === "website" ? "bg-purple-500 text-white" : "text-gray-500 hover:text-gray-600")}
              >
                <Globe className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />Website
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {([
                { key: "all" as Filter, label: "All" },
                { key: "lot-photos" as Filter, label: "Lot Photos" },
                { key: "vin-cloned" as Filter, label: "VIN-Cloned" },
                { key: "no-photos" as Filter, label: "No Photos" },
                { key: "ready" as Filter, label: "Ready" },
              ]).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    filter === f.key
                      ? "bg-purple-500 text-white border-purple-500"
                      : "bg-white text-gray-500 border-gray-200 hover:border-purple-300"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all shrink-0",
                settingsOpen
                  ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-600"
              )}
            >
              <Settings2 className="h-4 w-4 shrink-0" /> Studio Settings
            </button>
            {!transformed && !beforeStateRevealed && (
              <button
                type="button"
                onClick={onAnalyseInventory}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all"
              >
                <Search className="h-4 w-4 shrink-0" /> Analyse inventory
              </button>
            )}
            {!transformed && beforeStateRevealed && (
              <button
                type="button"
                onClick={onTransformAll}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all"
              >
                <Wand2 className="h-4 w-4 shrink-0" /> Transform all
              </button>
            )}
            {transformed && (
              <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                All Vehicles Transformed
              </Badge>
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {settingsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Matches v7 inventory “Settings” panel — Studio / Media Kit tabs */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-1 p-2 border-b border-gray-100">
                  <button
                    type="button"
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
                    type="button"
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

                {settingsTab === "studio" && (
                  <div className="p-5 space-y-6">
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
                            type="button"
                            onClick={() => setSelectedBg(i)}
                            onDoubleClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              openImage(bg.src, bg.label)
                            }}
                            title="Click to select · double-click to enlarge"
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
                      <button
                        type="button"
                        onClick={() =>
                          openGallery(STUDIO_BG_GALLERY_ITEMS, selectedBg, "Studio backgrounds")
                        }
                        className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
                      >
                        See All Backgrounds <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">Numberplate Masking</span>
                      </div>
                      <button
                        type="button"
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

                    <div className="space-y-3 border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">Video Template</p>
                        <button type="button" className="text-xs text-purple-600 font-medium hover:text-purple-700 flex items-center gap-1">
                          See All <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {[
                          { label: "Price Overlay", color: "from-blue-600 to-purple-600" },
                          { label: "Dealer Branded", color: "from-green-600 to-emerald-600" },
                        ].map((tmpl, i) => (
                          <button
                            key={i}
                            type="button"
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
                              type="button"
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

                {settingsTab === "mediakit" && (
                  <div className="p-5 space-y-6">
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
                              type="button"
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

                    <div className="space-y-3 border-t border-gray-100 pt-4">
                      <p className="text-sm font-semibold text-gray-900">Overlay Position</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {["Bottom Left", "Bottom Right", "Top Right", "Top Left"].map((pos, i) => (
                          <button key={pos} type="button" className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
                            i === 0 ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                          )}>
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>

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

      {/* Table view */}
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
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Days</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((car) => {
                  const thumb = getThumb(car)
                  const noPhotos = car.category === "no-photos" && !isCarDone(car)
                  const done = isCarDone(car)
                  return (
                    <tr
                      key={car.id}
                      onClick={() => {
                        if (beforeStateRevealed) onSelectCar(car.id)
                      }}
                      className={cn(
                        "border-b border-gray-100 transition-colors",
                        beforeStateRevealed && "cursor-pointer hover:bg-purple-500/5",
                        !beforeStateRevealed && "cursor-default",
                        diagnosticsVisible && !done && car.hasVinCloned && "bg-red-500/[0.03]",
                        diagnosticsVisible && !done && noPhotos && "bg-purple-500/[0.03]",
                        done && "bg-green-500/[0.02]",
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-gray-500 text-xs">{car.stockNo}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="relative w-16 h-11 shrink-0 cursor-zoom-in overflow-hidden rounded-lg border-0 bg-gray-100 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              const items = photoGalleryItemsForCar(car)
                              if (items.length > 1) {
                                openGallery(
                                  items,
                                  0,
                                  `${car.year} ${car.make} ${car.model}`,
                                )
                              } else if (items.length === 1) {
                                openImage(items[0].src, items[0].alt)
                              } else {
                                openImage(
                                  thumb && !noPhotos ? thumb : RAW(1),
                                  `${car.year} ${car.make} ${car.model}`,
                                )
                              }
                            }}
                            aria-label="View photo full size"
                          >
                            {thumb && !noPhotos ? (
                              <Image src={thumb} alt={car.model} fill className="object-cover" />
                            ) : (
                              <Image src={RAW(1)} alt="placeholder" fill className="object-cover opacity-40" />
                            )}
                          </button>
                          <div>
                            <p className="font-medium text-gray-900">{car.year} {car.make} {car.model}</p>
                            <p className="text-xs text-gray-400">{car.trim} · {car.color}</p>
                          </div>
                        </div>
                      </td>
                      <td
                        className="max-w-[200px] px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!diagnosticsVisible && !done ? (
                          <span className="text-gray-300">—</span>
                        ) : done ? (
                          (() => {
                            const items = photoGalleryItemsForCar(car)
                            if (items.length === 0) {
                              return (
                                <div className="flex items-center gap-1.5">
                                  <Camera className="h-3.5 w-3.5 text-green-400" />
                                  <span className="text-xs text-green-600">0</span>
                                </div>
                              )
                            }
                            return (
                              <div className="flex items-center gap-2">
                                <div className="flex shrink-0 -space-x-1.5">
                                  {items.slice(0, 4).map((item, idx) => (
                                    <button
                                      key={`${car.id}-g-${item.src}-${idx}`}
                                      type="button"
                                      className="relative z-[1] h-8 w-8 shrink-0 cursor-zoom-in overflow-hidden rounded-md border-0 p-0 ring-2 ring-white"
                                      onClick={() =>
                                        openGallery(
                                          items,
                                          idx,
                                          `${car.year} ${car.make} ${car.model}`,
                                        )
                                      }
                                      aria-label={`Open photo ${idx + 1}`}
                                    >
                                      <Image src={item.src} alt="" fill className="object-cover" sizes="32px" />
                                    </button>
                                  ))}
                                </div>
                                <div className="flex min-w-0 flex-col gap-0.5">
                                  {items.length > 4 && (
                                    <span className="text-[10px] text-gray-400">
                                      +{items.length - 4} more
                                    </span>
                                  )}
                                  <div className="flex items-center gap-1 text-xs text-green-600">
                                    <Camera className="h-3.5 w-3.5 shrink-0 text-green-400" />
                                    <span>{items.length}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          })()
                        ) : noPhotos ? (
                          <div className="flex items-center gap-1.5">
                            <ImageOff className="h-3.5 w-3.5 text-purple-400" />
                            <span className="text-xs font-medium text-purple-600">None</span>
                          </div>
                        ) : (
                          (() => {
                            const items = photoGalleryItemsForCar(car)
                            if (items.length === 0) {
                              return (
                                <div className="flex items-center gap-1.5">
                                  <Camera className="h-3.5 w-3.5 text-gray-400" />
                                  <span className="text-gray-500">0</span>
                                </div>
                              )
                            }
                            return (
                              <div className="flex items-center gap-2">
                                <div className="flex shrink-0 -space-x-1.5">
                                  {items.slice(0, 4).map((item, idx) => (
                                    <button
                                      key={`${car.id}-p-${item.src}-${idx}`}
                                      type="button"
                                      className="relative z-[1] h-8 w-8 shrink-0 cursor-zoom-in overflow-hidden rounded-md border-0 p-0 ring-2 ring-white"
                                      onClick={() =>
                                        openGallery(
                                          items,
                                          idx,
                                          `${car.year} ${car.make} ${car.model}`,
                                        )
                                      }
                                      aria-label={`Open photo ${idx + 1}`}
                                    >
                                      <Image src={item.src} alt="" fill className="object-cover" sizes="32px" />
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Camera className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                  <span>{items.length}</span>
                                </div>
                              </div>
                            )
                          })()
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!diagnosticsVisible && !done ? (
                          <span className="text-gray-300">—</span>
                        ) : done ? (
                          <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">Fixed</Badge>
                        ) : car.issues.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[260px]" onClick={(e) => e.stopPropagation()}>
                            {car.issues.map((issue, idx) => (
                              <IssueTooltipChip key={`${car.id}-${idx}-${issue.label}`} issue={issue} />
                            ))}
                          </div>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">Clean</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!diagnosticsVisible && !done ? (
                          <span className="text-gray-300">—</span>
                        ) : (
                          <span className={cn("font-medium", car.daysOnLot >= 10 ? "text-red-600" : car.daysOnLot >= 5 ? "text-amber-600" : "text-gray-500")}>
                            {car.daysOnLot}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!diagnosticsVisible && !done ? (
                          <Badge className="text-xs bg-gray-100 text-gray-400 border-gray-200">Pending audit</Badge>
                        ) : (
                          <Badge className={cn("text-xs", done ? "bg-green-500/20 text-green-600 border-green-500/30" : "bg-gray-200 text-gray-500 border-gray-200")}>
                            {done ? "Ready" : "Needs Review"}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Website (SRP) view */}
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

          <div className="bg-white max-h-[750px] overflow-y-auto">
            {/* Dealer header */}
            <div className="bg-red-600 text-white px-4 py-1.5 flex items-center justify-between text-[10px]">
              <span>📞 (888) 555-0199</span>
              <span>Mon–Sat 9AM–8PM</span>
            </div>
            <div className="border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {formData.dealerName.charAt(0)}
                </div>
                <span className="font-extrabold text-gray-900 text-sm">{formData.dealerName}</span>
              </div>
              <div className="flex items-center gap-0.5">
                {["New", "Pre-Owned", "Specials", "Finance", "Service"].map((item) => (
                  <span key={item} className={cn("px-2.5 py-1 text-[11px] font-medium rounded-md", item === "Pre-Owned" ? "text-red-600 bg-red-50" : "text-gray-500")}>{item}</span>
                ))}
              </div>
            </div>

            {/* Vehicle grid */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-900">{filtered.length} Vehicles for Sale</p>
                <span className="text-[10px] text-gray-400">Sort: Recommended ▾</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.slice(0, 12).map((car) => {
                  const thumb = getThumb(car)
                  const noPhotos = car.category === "no-photos" && !isCarDone(car)
                  const done = isCarDone(car)
                  const msrp = car.price + Math.round(car.price * 0.08)
                  return (
                    <div
                      key={car.id}
                      onClick={() => beforeStateRevealed && onSelectCar(car.id)}
                      className={cn(
                        "bg-white border border-gray-200 rounded-lg overflow-hidden transition-all group",
                        beforeStateRevealed && "cursor-pointer hover:shadow-lg",
                        !beforeStateRevealed && "cursor-default",
                      )}
                    >
                      <div className="relative aspect-[4/3] bg-gray-100">
                        {thumb && !noPhotos ? (
                          <Image src={thumb} alt={car.model} fill className="pointer-events-none object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <Image src={RAW(1)} alt="placeholder" fill className="pointer-events-none object-cover opacity-40" />
                        )}
                        <button
                          type="button"
                          className="absolute inset-0 z-[1] cursor-zoom-in border-0 bg-transparent p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            const items = photoGalleryItemsForCar(car)
                            if (items.length > 1) {
                              openGallery(
                                items,
                                0,
                                `${car.year} ${car.make} ${car.model}`,
                              )
                            } else if (items.length === 1) {
                              openImage(items[0].src, items[0].alt)
                            } else {
                              openImage(
                                thumb && !noPhotos ? thumb : RAW(1),
                                `${car.year} ${car.make} ${car.model}`,
                              )
                            }
                          }}
                          aria-label="View photo full size"
                        />
                        {diagnosticsVisible && !done && car.issues.length > 0 && (
                          <div className="absolute top-1.5 right-1.5">
                            <span className="bg-red-500 text-white w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center shadow-sm">
                              {car.issues.length}
                            </span>
                          </div>
                        )}
                        {done && (
                          <div className="absolute top-1.5 right-1.5">
                            <CheckCircle2 className="h-5 w-5 text-green-500 drop-shadow" />
                          </div>
                        )}
                        {diagnosticsVisible && car.hasVinCloned && !done && (
                          <div className="absolute bottom-1.5 left-1.5">
                            <span className="bg-amber-100 text-amber-800 text-[8px] font-semibold px-1.5 py-0.5 rounded border border-amber-200">VIN Cloned</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="font-bold text-gray-900 text-[11px] leading-tight">{car.year} {car.make} {car.model}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{car.trim} · {car.color}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="font-bold text-sm text-gray-900">${car.price.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 line-through">${msrp.toLocaleString()}</p>
                        </div>
                        {diagnosticsVisible && !done && car.issues.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 mt-1.5" onClick={(e) => e.stopPropagation()}>
                            {car.issues.map((issue, idx) => (
                              <IssueTooltipChip key={`${car.id}-web-${idx}-${issue.label}`} issue={issue} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}
