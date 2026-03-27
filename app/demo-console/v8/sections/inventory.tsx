"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  AlertTriangle, Camera, ChevronDown, CheckCircle2,
  Globe, ImageOff, Settings2, Wand2, X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScoreRing } from "../components/score-ring"
import type { InventoryCar, FormData, CarCategory } from "../page"
import { RAW, qualityScore } from "../page"

type ViewMode = "table" | "website"
type Filter = "all" | CarCategory

export function InventorySection({
  inventory,
  formData,
  isCarDone,
  transformed,
  onSelectCar,
  onTransformAll,
  onGoToTransform,
}: {
  inventory: InventoryCar[]
  formData: FormData
  isCarDone: (car: InventoryCar) => boolean
  transformed: boolean
  onSelectCar: (carId: string) => void
  onTransformAll: () => void
  onGoToTransform: () => void
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [filter, setFilter] = useState<Filter>("all")
  const [settingsOpen, setSettingsOpen] = useState(false)

  const totalIssues = inventory.reduce((s, c) => s + (isCarDone(c) ? 0 : c.issues.length), 0)
  const vinClonedCount = inventory.filter((c) => c.hasVinCloned && !isCarDone(c)).length
  const noPhotosCount = inventory.filter((c) => c.category === "no-photos" && !isCarDone(c)).length
  const avgScore = Math.round(
    inventory.reduce((s, c) => s + qualityScore(isCarDone(c) ? [] : c.issues), 0) / Math.max(1, inventory.length)
  )

  const filtered = filter === "all" ? inventory : inventory.filter((c) => c.category === filter)

  function getThumb(car: InventoryCar): string {
    if (isCarDone(car)) return car.spynePhotos[0] || car.smartMatchPhotos[0] || `/demo-console/processed/processed-09.png`
    return car.lotPhotos[0] || car.vinClonedPhotos[0] || ""
  }

  return (
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
              {transformed && card.label !== "Active Listings" ? 0 : card.value}
            </p>
            {transformed && card.label !== "Active Listings" && (
              <p className="text-xs text-green-500 mt-0.5">All fixed</p>
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
          <ScoreRing
            value={transformed ? 94 : avgScore}
            size={48}
            stroke={4}
            color={transformed ? "text-green-500" : "text-amber-500"}
          />
          <div>
            <p className="text-sm text-gray-500">Media Score</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {transformed ? "Excellent" : "Needs work"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("table")}
              className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-all", viewMode === "table" ? "bg-purple-500 text-white" : "text-gray-500 hover:text-gray-600")}
            >
              Inventory
            </button>
            <button
              onClick={() => setViewMode("website")}
              className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-all", viewMode === "website" ? "bg-purple-500 text-white" : "text-gray-500 hover:text-gray-600")}
            >
              <Globe className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />Website
            </button>
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-1.5">
            {([
              { key: "all" as Filter, label: "All" },
              { key: "lot-photos" as Filter, label: "Lot Photos" },
              { key: "vin-cloned" as Filter, label: "VIN-Cloned" },
              { key: "no-photos" as Filter, label: "No Photos" },
              { key: "ready" as Filter, label: "Ready" },
            ]).map((f) => (
              <button
                key={f.key}
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
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-2 transition-colors"
          >
            <Settings2 className="h-4 w-4" /> Studio Settings
          </button>
          {!transformed && (
            <button
              onClick={onTransformAll}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-4 py-2 text-sm font-semibold text-white transition-all"
            >
              <Wand2 className="h-4 w-4" /> Transform All
            </button>
          )}
          {transformed && (
            <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
              All Vehicles Transformed
            </Badge>
          )}
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Studio Configuration</p>
                <button onClick={() => setSettingsOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Background</p>
                  <div className="flex gap-2">
                    {["bg-white border-2 border-gray-200", "bg-gradient-to-br from-green-100 to-blue-100", "bg-gradient-to-br from-gray-800 to-gray-900", "bg-gradient-to-br from-purple-100 to-purple-200"].map((c, i) => (
                      <div key={i} className={cn("w-8 h-8 rounded-lg cursor-pointer ring-offset-2 transition-all", c, i === 0 && "ring-2 ring-purple-500")} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Plate Masking</p>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-5 rounded-full bg-purple-500 p-0.5 cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-white translate-x-4 transition-transform" />
                    </div>
                    <span className="text-xs text-gray-600">On</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Products</p>
                  <div className="space-y-1">
                    {["Images", "360° Spin", "Video Tour"].map((p) => (
                      <label key={p} className="flex items-center gap-2 text-xs text-gray-600">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600" />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Media Kit</p>
                  <div className="space-y-1">
                    {["Watermark", "Finance Card", "Hero Badge"].map((p) => (
                      <label key={p} className="flex items-center gap-2 text-xs text-gray-600">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600" />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                      onClick={() => onSelectCar(car.id)}
                      className={cn(
                        "border-b border-gray-100 cursor-pointer transition-colors hover:bg-purple-500/5",
                        !done && car.hasVinCloned && "bg-red-500/[0.03]",
                        !done && noPhotos && "bg-purple-500/[0.03]",
                        done && "bg-green-500/[0.02]",
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-gray-500 text-xs">{car.stockNo}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {thumb && !noPhotos ? (
                              <Image src={thumb} alt={car.model} fill className="object-cover" />
                            ) : (
                              <Image src={RAW(1)} alt="placeholder" fill className="object-cover opacity-40" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{car.year} {car.make} {car.model}</p>
                            <p className="text-xs text-gray-400">{car.trim} · {car.color}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {done ? (
                          <div className="flex items-center gap-1.5">
                            <Camera className="h-3.5 w-3.5 text-green-400" />
                            <span className="text-green-600 text-xs">{car.spynePhotos.length || car.smartMatchPhotos.length}</span>
                          </div>
                        ) : noPhotos ? (
                          <div className="flex items-center gap-1.5">
                            <ImageOff className="h-3.5 w-3.5 text-purple-400" />
                            <span className="text-purple-600 text-xs font-medium">None</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Camera className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-500">{car.lotPhotos.length + car.vinClonedPhotos.length}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {done ? (
                          <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">Fixed</Badge>
                        ) : car.issues.length > 0 ? (
                          <div className="space-y-1">
                            <Badge className={cn("text-xs", car.issues.some((is) => is.severity === "high") ? "bg-red-500/20 text-red-600 border-red-500/30" : "bg-amber-500/20 text-amber-600 border-amber-500/30")}>
                              {car.issues.length} issue{car.issues.length !== 1 && "s"}
                            </Badge>
                          </div>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">Clean</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("font-medium", car.daysOnLot >= 10 ? "text-red-600" : car.daysOnLot >= 5 ? "text-amber-600" : "text-gray-500")}>
                          {car.daysOnLot}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={cn("text-xs", done ? "bg-green-500/20 text-green-600 border-green-500/30" : "bg-gray-200 text-gray-500 border-gray-200")}>
                          {done ? "Ready" : "Needs Review"}
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
                      onClick={() => onSelectCar(car.id)}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="relative aspect-[4/3] bg-gray-100">
                        {thumb && !noPhotos ? (
                          <Image src={thumb} alt={car.model} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <Image src={RAW(1)} alt="placeholder" fill className="object-cover opacity-40" />
                        )}
                        {!done && car.issues.length > 0 && (
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
                        {car.hasVinCloned && !done && (
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
  )
}
