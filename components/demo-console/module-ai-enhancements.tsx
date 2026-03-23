"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sun,
  RotateCcw,
  Droplets,
  Layers,
  Palette,
  CheckCircle2,
  Shield,
  Monitor,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DEMO_VEHICLE } from "@/lib/demo-store"

type TabKey = "background" | "corrections" | "compliance"

const tabs: { key: TabKey; label: string }[] = [
  { key: "background", label: "Background" },
  { key: "corrections", label: "Corrections" },
  { key: "compliance", label: "Compliance" },
]

const corrections = [
  { icon: Layers, label: "Shadow Added", desc: "Natural ground shadows for depth" },
  { icon: RotateCcw, label: "Tilt Corrected", desc: "Leveled to perfect horizontal" },
  { icon: Sun, label: "Exposure Fixed", desc: "Balanced brightness and contrast" },
  { icon: Droplets, label: "Dehaze Removed", desc: "Crystal clear image quality" },
  { icon: Eye, label: "Reflection Added", desc: "Subtle floor reflection" },
  { icon: Palette, label: "Color Normalized", desc: "Consistent color across all images" },
]

const backgrounds = [
  { id: "white-studio", label: "White Studio", color: "bg-white border-2" },
  { id: "outdoor", label: "Outdoor", color: "bg-gradient-to-br from-green-100 to-blue-100" },
  { id: "city-night", label: "City Night", color: "bg-gradient-to-br from-gray-800 to-gray-900" },
  { id: "branded", label: "Branded", color: "bg-gradient-to-br from-purple-100 to-purple-200" },
]

const allPills = [
  "Background removed",
  "White studio applied",
  "Shadow added",
  "Tilt corrected",
  "Exposure fixed",
  "Dehazed",
  "Reflection added",
  "Colors normalized",
  "Plate masked",
  "AutoTrader ready",
  "Facebook ready",
  "Google ready",
]

export function ModuleAIEnhancements() {
  const [activeTab, setActiveTab] = useState<TabKey>("background")
  const [selectedBg, setSelectedBg] = useState("white-studio")
  const [appliedCorrections, setAppliedCorrections] = useState<number[]>([])
  const [dividerPos, setDividerPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Auto-apply corrections when tab is active
  useEffect(() => {
    if (activeTab !== "corrections") return
    setAppliedCorrections([])
    const timers: NodeJS.Timeout[] = []
    corrections.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setAppliedCorrections((prev) => [...prev, i])
        }, 600 + i * 300)
      )
    })
    return () => timers.forEach(clearTimeout)
  }, [activeTab])

  const bgLabel = backgrounds.find((b) => b.id === selectedBg)?.label ?? "White Studio"

  const handleMouseDown = useCallback(() => {
    isDragging.current = true
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100))
    setDividerPos(pct)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100))
    setDividerPos(pct)
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">
          From raw to retail-ready. Automatically.
        </h1>
      </motion.div>

      {/* Tab selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="inline-flex gap-1 bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "background" && (
          <motion.div
            key="background"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Before/After comparison */}
            <Card>
              <CardContent className="p-6">
                <div
                  ref={containerRef}
                  className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 select-none cursor-ew-resize"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >
                  {/* Before side (full width, clipped) */}
                  <div
                    className="absolute inset-0 bg-gray-200 flex items-end justify-start"
                    style={{ clipPath: `inset(0 ${100 - dividerPos}% 0 0)` }}
                  >
                    <div className="p-4">
                      <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                        Original — Dealer forecourt, distracting
                      </span>
                    </div>
                  </div>

                  {/* After side (full width, clipped) */}
                  <div
                    className="absolute inset-0 bg-purple-50 flex items-end justify-end"
                    style={{ clipPath: `inset(0 0 0 ${dividerPos}%)` }}
                  >
                    <div className="p-4">
                      <span className="bg-purple-600/80 text-white text-xs px-3 py-1.5 rounded-full">
                        {bgLabel}
                      </span>
                    </div>
                  </div>

                  {/* Divider line */}
                  <div
                    className="absolute top-0 bottom-0 z-10"
                    style={{ left: `${dividerPos}%`, transform: "translateX(-50%)" }}
                  >
                    <div className="h-full w-0.5 bg-white" />
                    {/* Drag handle */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
                      onMouseDown={handleMouseDown}
                      onTouchStart={handleMouseDown}
                    >
                      <ChevronLeft className="h-3 w-3 text-gray-600 -mr-0.5" />
                      <ChevronRight className="h-3 w-3 text-gray-600 -ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Background swatches */}
                <div className="mt-4 flex gap-3">
                  {backgrounds.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBg(bg.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                        selectedBg === bg.id
                          ? "border-purple-500 ring-2 ring-purple-200"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className={cn("w-6 h-6 rounded-md border border-gray-200", bg.color)} />
                      <span className="text-xs font-medium text-gray-700">{bg.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "corrections" && (
          <motion.div
            key="corrections"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {corrections.map((item, i) => {
                const isApplied = appliedCorrections.includes(i)
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card
                      className={cn(
                        "transition-all duration-300",
                        isApplied ? "bg-green-50 border-green-200" : ""
                      )}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "mt-0.5 p-2 rounded-lg",
                                isApplied ? "bg-green-100" : "bg-gray-100"
                              )}
                            >
                              <item.icon
                                className={cn(
                                  "h-4 w-4",
                                  isApplied ? "text-green-600" : "text-gray-400"
                                )}
                              />
                            </div>
                            <div>
                              <p
                                className={cn(
                                  "text-sm font-semibold",
                                  isApplied ? "text-green-900" : "text-gray-900"
                                )}
                              >
                                {item.label}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs shrink-0 transition-all duration-300",
                              isApplied
                                ? "border-green-300 text-green-700 bg-green-50"
                                : "border-gray-200 text-gray-400"
                            )}
                          >
                            {isApplied ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Applied
                              </span>
                            ) : (
                              "Pending"
                            )}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {activeTab === "compliance" && (
          <motion.div
            key="compliance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Number Plate Masking */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">Number Plate Masking</h3>
                    </div>
                    {/* Plate visualization */}
                    <div className="flex items-center justify-center py-6">
                      <div className="relative">
                        <div className="w-48 h-12 rounded-md bg-gray-200 border border-gray-300 flex items-center justify-center">
                          <span className="font-mono text-lg text-gray-600 tracking-wider">
                            AB12 CDE
                          </span>
                        </div>
                        <div className="absolute inset-0 rounded-md backdrop-blur-md bg-white/30" />
                        <div className="absolute inset-0 rounded-md border-2 border-purple-400 flex items-center justify-center">
                          <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                            MASKED
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Automatically detected and masked</p>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Compliant ✓
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Platform Ready */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">Platform Ready</h3>
                    </div>
                    <div className="py-6 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {["AutoTrader", "Facebook", "Google"].map((platform) => (
                          <motion.span
                            key={platform}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs font-medium"
                          >
                            {platform} ✓
                          </motion.span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">GDPR and platform-ready</p>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      All platforms ✓
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* What we fixed — pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              What we fixed
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allPills.map((pill, i) => (
                <motion.span
                  key={pill}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="bg-green-100 text-green-700 text-xs rounded-full px-2.5 py-1 whitespace-nowrap shrink-0"
                >
                  {pill}
                </motion.span>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Value callout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-900">
              Manual editing: <strong>$8–$15/image × 38 images = $304–$570</strong>. Spyne:{" "}
              <strong>$0</strong>. Time: <strong>0 minutes</strong>.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
