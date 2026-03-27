"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DEMO_VEHICLE } from "@/lib/demo-store"

type PlatformKey = "website" | "autotrader" | "cargurus"

const platformTabs: { key: PlatformKey; label: string; emoji: string }[] = [
  { key: "website", label: "Dealer Website", emoji: "🌍" },
  { key: "autotrader", label: "AutoTrader", emoji: "🚗" },
  { key: "cargurus", label: "CarGurus", emoji: "🔍" },
]

export function ModulePlatformPreview() {
  const [activePlatform, setActivePlatform] = useState<PlatformKey>("website")

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">See how your listing looks — before it goes live.</h1>
        <p className="text-gray-500 mt-1 text-sm">Preview your vehicle on every major platform. Pixel-perfect, branded, ready.</p>
      </motion.div>

      {/* Platform tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="inline-flex gap-1 bg-gray-100 p-1 rounded-xl">
          {platformTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActivePlatform(tab.key)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2",
                activePlatform === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Preview content */}
      <AnimatePresence mode="wait">
        {activePlatform === "website" && (
          <motion.div
            key="website"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* Browser mockup */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <div className="h-8 bg-gray-200 rounded-t-xl flex items-center px-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="bg-white rounded px-2 py-0.5 text-xs text-gray-500 ml-3 flex-1">
                  quickshiftautos.co.uk/inventory/{DEMO_VEHICLE.vin}
                </div>
              </div>
              <div className="bg-white p-6 space-y-4">
                {/* Branded nav */}
                <div className="h-10 bg-purple-600 rounded flex items-center px-4">
                  <span className="text-white text-xs font-medium">QuickShift Autos</span>
                </div>
                {/* Hero image */}
                <div className="aspect-[16/9] bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-20 bg-gray-300/50 rounded-lg mx-auto mb-2" />
                    <span className="text-xs text-purple-500">Professional Studio Background</span>
                  </div>
                </div>
                {/* Thumbnail strip */}
                <div className="flex gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={cn("w-16 h-12 rounded border-2", i === 0 ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-gray-100")} />
                  ))}
                  <div className="w-16 h-12 rounded border-2 border-gray-200 bg-gray-900 flex items-center justify-center">
                    <span className="text-white text-[10px]">360°</span>
                  </div>
                </div>
                {/* Details */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{DEMO_VEHICLE.year} {DEMO_VEHICLE.make} {DEMO_VEHICLE.model}</p>
                    <p className="text-sm text-gray-500">{DEMO_VEHICLE.color} · VIN: {DEMO_VEHICLE.vin.slice(-6)}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${DEMO_VEHICLE.price.toLocaleString()}</p>
                </div>
                {/* CTA row */}
                <div className="flex gap-2">
                  <div className="bg-purple-600 text-white text-xs px-4 py-2 rounded-lg font-medium">Book Test Drive</div>
                  <div className="bg-white border text-gray-700 text-xs px-4 py-2 rounded-lg font-medium">Call Dealer</div>
                  <div className="bg-white border text-gray-700 text-xs px-4 py-2 rounded-lg font-medium">Finance Calculator</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activePlatform === "autotrader" && (
          <motion.div
            key="autotrader"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              {/* AutoTrader header */}
              <div className="h-10 bg-[#FF6B35] flex items-center px-4 gap-2">
                <span className="text-white font-bold text-sm">Auto Trader</span>
                <div className="flex-1" />
                <div className="bg-white/20 rounded px-2 py-0.5 text-white text-xs">Search</div>
              </div>
              <div className="bg-white p-6 space-y-4">
                {/* Main image + gallery */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-28 h-16 bg-gray-300/50 rounded mx-auto mb-1" />
                      <span className="text-[10px] text-gray-400">Spyne-enhanced image</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="aspect-[4/3] bg-gray-100 rounded" />
                    ))}
                  </div>
                </div>
                {/* Vehicle info */}
                <div className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{DEMO_VEHICLE.year} {DEMO_VEHICLE.make} {DEMO_VEHICLE.model}</p>
                      <p className="text-sm text-gray-500">{DEMO_VEHICLE.color}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">£{(DEMO_VEHICLE.price * 0.79).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <Badge className="bg-green-100 text-green-700 text-[10px]">Great Price</Badge>
                    </div>
                  </div>
                </div>
                {/* Badges */}
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">📸 38 photos</span>
                  <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">🔄 360° view</span>
                  <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">🎬 Video tour</span>
                  <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full">✓ Plate masked</span>
                </div>
                {/* Dealer card */}
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-xs">QS</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">QuickShift Autos</p>
                    <p className="text-xs text-gray-500">Trusted Dealer · 4.8★</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activePlatform === "cargurus" && (
          <motion.div
            key="cargurus"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              {/* CarGurus header */}
              <div className="h-10 bg-[#6DB33F] flex items-center px-4 gap-2">
                <span className="text-white font-bold text-sm">CarGurus</span>
                <div className="flex-1" />
                <div className="bg-white/20 rounded px-2 py-0.5 text-white text-xs">Search Cars</div>
              </div>
              <div className="bg-white p-6 space-y-4">
                {/* Deal rating banner */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                  <div className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded">GREAT DEAL</div>
                  <div>
                    <p className="text-sm font-medium text-green-800">$1,204 below market price</p>
                    <p className="text-xs text-green-600">Based on similar listings in your area</p>
                  </div>
                </div>
                {/* Image gallery */}
                <div className="aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center relative">
                  <div className="text-center">
                    <div className="w-28 h-16 bg-gray-300/50 rounded mx-auto mb-1" />
                    <span className="text-[10px] text-gray-400">Professional background</span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    1 / 38
                  </div>
                </div>
                {/* Vehicle details */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{DEMO_VEHICLE.year} {DEMO_VEHICLE.make} {DEMO_VEHICLE.model}</p>
                    <p className="text-sm text-gray-500">{DEMO_VEHICLE.color} · 12,450 miles</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">${DEMO_VEHICLE.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Est. $389/mo</p>
                  </div>
                </div>
                {/* Features pills */}
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">📸 38 HD Photos</span>
                  <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">🔄 360° Spin</span>
                  <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">🎬 Video Walkaround</span>
                </div>
                {/* CTA buttons */}
                <div className="flex gap-2">
                  <div className="bg-[#6DB33F] text-white text-xs px-4 py-2 rounded-lg font-medium flex-1 text-center">Request Information</div>
                  <div className="bg-white border text-gray-700 text-xs px-4 py-2 rounded-lg font-medium flex-1 text-center">Schedule Test Drive</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison strip */}
      <motion.div
        className="grid grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-red-500 uppercase font-semibold mb-1">Without Spyne</p>
            <p className="text-sm text-red-800">Inconsistent images, no 360°, no video, manual resizing per platform</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-green-500 uppercase font-semibold mb-1">With Spyne</p>
            <p className="text-sm text-green-800">Pixel-perfect on every platform, rich media, auto-formatted</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Value callout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-900">
              <strong>Listings with professional media get 3× more leads.</strong> Preview before publishing to ensure every platform shows your best.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
