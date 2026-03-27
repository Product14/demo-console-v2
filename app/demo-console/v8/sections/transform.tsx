"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Camera, CheckCircle2, ChevronLeft, ChevronRight, Clock, DollarSign, GripVertical, ImageOff, Play, RotateCcw, Search, Send, Sparkles, Wand2, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { AIPipelineGraph } from "../components/ai-pipeline-graph"
import { SpeedCounter } from "../components/speed-counter"
import type { InventoryCar } from "../page"
import { RAW, PROC, qualityScore } from "../page"

type SubPhase = "surgery" | "cascade"

const TRANSFORM_LABELS = [
  "Analyzing images…",
  "Removing backgrounds…",
  "Correcting angles…",
  "Removing watermarks…",
  "Replacing VIN-cloned images…",
  "Running Smart Match…",
  "Optimizing for marketplaces…",
  "Applying branding…",
  "Finalizing…",
]

const FEATURE_FIXES = [
  { key: "logoPlacement", label: "Custom Logo Placement", top: "4%", left: "4%" },
  { key: "bgRemove", label: "BG Remove", top: "25%", left: "73%" },
  { key: "reflection", label: "Reflection", top: "78%", left: "3%" },
  { key: "numberPlate", label: "Custom Numberplate", top: "65%", left: "58%" },
  { key: "shadowGen", label: "Shadow Gen", top: "88%", left: "35%" },
]

export function TransformSection({
  selectedCar,
  inventory,
  transformed,
  transformedIds,
  isCarDone,
  onTransformSingle,
  onTransformAll,
  onGoLive,
}: {
  selectedCar: InventoryCar | null
  inventory: InventoryCar[]
  transformed: boolean
  transformedIds: Set<string>
  isCarDone: (car: InventoryCar) => boolean
  onTransformSingle: (carId: string) => void
  onTransformAll: () => void
  onGoLive: () => void
}) {
  const [subPhase, setSubPhase] = useState<SubPhase>("surgery")
  const [revealPct, setRevealPct] = useState(0)
  const [surgeryRunning, setSurgeryRunning] = useState(false)
  const [surgeryDone, setSurgeryDone] = useState(false)
  const [showPipeline, setShowPipeline] = useState(false)
  const [showSplitter, setShowSplitter] = useState(false)
  const [showValue, setShowValue] = useState(false)
  const [dividerPos, setDividerPos] = useState(50)
  const [showAnnotated, setShowAnnotated] = useState(false)
  const [featureToggles, setFeatureToggles] = useState<Record<string, boolean>>({
    logoPlacement: true, bgRemove: true, reflection: true, numberPlate: true, shadowGen: true,
  })
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cascade state
  const [cascadeRunning, setCascadeRunning] = useState(false)
  const [cascadeComplete, setCascadeComplete] = useState(false)
  const [cascadeTransformed, setCascadeTransformed] = useState<Set<number>>(new Set())
  const [bulkTransforming, setBulkTransforming] = useState(false)
  const [bulkProgress, setBulkProgress] = useState(0)
  const [bulkLabelIdx, setBulkLabelIdx] = useState(0)

  const car = selectedCar
  const isNoPhotos = car?.category === "no-photos"
  const rawImg = RAW(3)
  const procImg = PROC(9)
  const score = car ? qualityScore(car.issues) : 50
  const carLabel = car ? `${car.year} ${car.make} ${car.model}` : "this vehicle"

  const activeFeatureCount = Object.values(featureToggles).filter(Boolean).length
  const featureBlendOpacity = activeFeatureCount / FEATURE_FIXES.length
  const toggleFeature = useCallback((key: string) => {
    setFeatureToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  // Smart Match animation state
  const [smartMatchStep, setSmartMatchStep] = useState(0)
  const [smartMatchPhotos, setSmartMatchPhotos] = useState<string[]>([])

  // Auto-start surgery on mount
  useEffect(() => {
    if (subPhase !== "surgery") return
    setSurgeryRunning(false)
    setSurgeryDone(false)
    setShowPipeline(false)
    setShowSplitter(false)
    setShowValue(false)
    setShowAnnotated(false)
    setFeatureToggles({ logoPlacement: true, bgRemove: true, reflection: true, numberPlate: true, shadowGen: true })
    setRevealPct(0)
    setSmartMatchStep(0)
    setSmartMatchPhotos([])

    if (isNoPhotos) {
      const photos = car?.smartMatchPhotos.length
        ? car.smartMatchPhotos
        : [PROC(1), PROC(2), PROC(3), PROC(4)]

      const step1 = setTimeout(() => setSmartMatchStep(1), 500)
      const step2 = setTimeout(() => setSmartMatchStep(2), 2000)
      const step3 = setTimeout(() => {
        setSmartMatchStep(3)
        photos.forEach((photo, i) => {
          setTimeout(() => {
            setSmartMatchPhotos((prev) => [...prev, photo])
          }, i * 400)
        })
      }, 3500)
      const step4 = setTimeout(() => {
        setSmartMatchStep(4)
        if (car) onTransformSingle(car.id)
        setTimeout(() => setShowPipeline(true), 500)
        setTimeout(() => setShowValue(true), 1200)
      }, 3500 + photos.length * 400 + 500)

      return () => {
        clearTimeout(step1)
        clearTimeout(step2)
        clearTimeout(step3)
        clearTimeout(step4)
      }
    }

    const startTimer = setTimeout(() => {
      setSurgeryRunning(true)
      let pct = 0
      const interval = setInterval(() => {
        pct += 2
        setRevealPct(Math.min(pct, 100))
        if (pct >= 100) clearInterval(interval)
      }, 40)
      return () => clearInterval(interval)
    }, 500)

    return () => clearTimeout(startTimer)
  }, [subPhase, isNoPhotos])

  function handleSurgeryComplete() {
    setSurgeryDone(true)
    setSurgeryRunning(false)
    if (car) onTransformSingle(car.id)
    setTimeout(() => setShowPipeline(true), 500)
    setTimeout(() => setShowSplitter(true), 1200)
    setTimeout(() => setShowAnnotated(true), 2000)
    setTimeout(() => setShowValue(true), 2800)
  }

  // Drag splitter
  const handleMouseDown = useCallback(() => { isDragging.current = true }, [])
  const handleMouseUp = useCallback(() => { isDragging.current = false }, [])
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setDividerPos(Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100)))
  }, [])

  // Cascade
  function startCascade() {
    setSubPhase("cascade")
    setCascadeRunning(true)
    setCascadeTransformed(new Set())
    setCascadeComplete(false)

    let idx = 0
    const interval = setInterval(() => {
      setCascadeTransformed((prev) => new Set(prev).add(idx))
      idx++
      if (idx >= inventory.length) {
        clearInterval(interval)
        onTransformAll()
        setTimeout(() => {
          setCascadeRunning(false)
          setCascadeComplete(true)
        }, 300)
      }
    }, 40)
  }

  // Bulk transform (alternative path from inventory)
  useEffect(() => {
    if (!bulkTransforming) return
    let step = 0
    const total = 60
    const timer = setInterval(() => {
      step++
      setBulkProgress((step / total) * 100)
      setBulkLabelIdx(Math.min(TRANSFORM_LABELS.length - 1, Math.floor((step / total) * TRANSFORM_LABELS.length)))
      if (step >= total) {
        clearInterval(timer)
        setBulkTransforming(false)
        onTransformAll()
        setCascadeComplete(true)
      }
    }, 50)
    return () => clearInterval(timer)
  }, [bulkTransforming, onTransformAll])

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* ── SURGERY ── */}
        {subPhase === "surgery" && (
          <motion.div key="surgery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="text-center">
              <p className="text-gray-500 text-lg">
                {isNoPhotos
                  ? <>Running Smart Match for <span className="text-gray-900 font-medium">{carLabel}</span></>
                  : <>Transforming <span className="text-gray-900 font-medium">{carLabel}</span></>}
              </p>
            </div>

            {isNoPhotos ? (
              <>
                {/* Smart Match animation */}
                <div className="relative w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-200" style={{ minHeight: 400 }}>
                  <div className="p-8 space-y-8">
                    {/* Step indicators */}
                    <div className="flex items-center justify-center gap-3">
                      {[
                        { label: "Searching inventory", icon: Search },
                        { label: "Matching features", icon: Zap },
                        { label: "Generating photos", icon: Camera },
                        { label: "Complete", icon: CheckCircle2 },
                      ].map((step, i) => {
                        const active = smartMatchStep === i + 1
                        const done = smartMatchStep > i + 1
                        return (
                          <div key={step.label} className="flex items-center gap-2">
                            <motion.div
                              initial={{ opacity: 0.3, scale: 0.9 }}
                              animate={{
                                opacity: active || done ? 1 : 0.3,
                                scale: active ? 1.05 : 1,
                              }}
                              className={cn(
                                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors",
                                done ? "bg-green-50 border-green-300 text-green-700" :
                                active ? "bg-purple-50 border-purple-300 text-purple-700" :
                                "bg-gray-50 border-gray-200 text-gray-400"
                              )}
                            >
                              {done ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : active ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                  <step.icon className="h-4 w-4" />
                                </motion.div>
                              ) : (
                                <step.icon className="h-4 w-4" />
                              )}
                              {step.label}
                            </motion.div>
                            {i < 3 && <div className={cn("w-6 h-px", done ? "bg-green-300" : "bg-gray-200")} />}
                          </div>
                        )
                      })}
                    </div>

                    {/* Smart Match searching animation */}
                    {smartMatchStep >= 1 && smartMatchStep < 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8"
                      >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-100 flex items-center justify-center">
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <Search className="h-8 w-8 text-purple-500" />
                          </motion.div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          {smartMatchStep === 1
                            ? `Searching for ${car?.make} ${car?.model} across dealer network…`
                            : `Matching exterior features and angles for ${carLabel}…`}
                        </p>
                      </motion.div>
                    )}

                    {/* Generated photos appearing */}
                    {smartMatchStep >= 3 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                      >
                        <p className="text-sm font-medium text-gray-900 text-center">
                          {smartMatchStep >= 4
                            ? `${smartMatchPhotos.length} studio-quality photos generated`
                            : `Generating photos…`}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {smartMatchPhotos.map((src, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ duration: 0.4 }}
                              className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 ring-2 ring-green-400"
                            >
                              <Image src={src} alt={`Smart Match ${i + 1}`} fill className="object-cover" />
                              <div className="absolute top-2 right-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 drop-shadow" />
                              </div>
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                                <p className="text-[10px] text-white font-medium">Smart Match</p>
                              </div>
                            </motion.div>
                          ))}
                          {smartMatchStep < 4 && Array.from({ length: Math.max(0, (car?.smartMatchPhotos.length || 4) - smartMatchPhotos.length) }).map((_, i) => (
                            <div key={`placeholder-${i}`} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
                              <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                <ImageOff className="h-6 w-6 text-gray-300" />
                              </motion.div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Hero image with clip-path reveal */}
                <div
                  ref={containerRef}
                  className="relative w-full rounded-2xl overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing"
                  style={{ height: "65vh", maxHeight: 650 }}
                  onMouseMove={showSplitter ? handleMouseMove : undefined}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Processed image (bottom layer) */}
                  <Image src={procImg} alt="Processed" fill className="object-cover" priority />

                  {/* Raw image (top layer, clipped away) */}
                  <div
                    className="absolute inset-0 transition-none"
                    style={{
                      clipPath: showSplitter
                        ? `inset(0 ${100 - dividerPos}% 0 0)`
                        : `inset(0 ${revealPct}% 0 0)`,
                    }}
                  >
                    <Image src={rawImg} alt="Raw" fill className="object-cover" />
                  </div>

                  {/* Labels */}
                  <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-600">
                    {showSplitter ? "Your lot photo" : "Before"}
                  </div>
                  <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-purple-600">
                    {showSplitter ? "Studio AI output" : "After"}
                  </div>

                  {/* Speed counter */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <SpeedCounter
                      running={surgeryRunning}
                      targetMs={1200}
                      onComplete={handleSurgeryComplete}
                    />
                  </div>

                  {/* Drag handle (after surgery) */}
                  {showSplitter && (
                    <div
                      className="absolute top-0 bottom-0 z-20 flex items-center"
                      style={{ left: `${dividerPos}%`, transform: "translateX(-50%)" }}
                      onMouseDown={handleMouseDown}
                      onTouchStart={() => { isDragging.current = true }}
                    >
                      <div className="w-1 h-full bg-white/80" />
                      <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-purple-400 flex items-center justify-center shadow-lg cursor-grab">
                        <GripVertical className="h-4 w-4 text-purple-400" />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* AI Pipeline Graph */}
            {showPipeline && <AIPipelineGraph delay={0} />}

            {/* Annotated output — what Spyne fixed */}
            {showAnnotated && !isNoPhotos && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                  What Spyne fixed
                </p>

                <div
                  className="relative w-full rounded-2xl overflow-hidden bg-gray-100"
                  style={{ aspectRatio: "16/10" }}
                >
                  {/* Raw image (base layer — visible when toggles are off) */}
                  <Image src={rawImg} alt="Before" fill className="object-cover" />

                  {/* Processed image (overlay — fades based on active toggles) */}
                  <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{ opacity: featureBlendOpacity }}
                  >
                    <Image src={procImg} alt="After" fill className="object-cover" />
                  </div>

                  {/* Dashed car outline */}
                  <div className="absolute top-[18%] left-[12%] right-[12%] bottom-[12%] border-2 border-dashed border-white/40 rounded-3xl pointer-events-none z-10" />

                  {/* Elliptical floor reflection indicator */}
                  {featureToggles.reflection && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-[5%] left-[18%] right-[18%] h-[10%] pointer-events-none z-10"
                    >
                      <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                        <ellipse
                          cx="100" cy="20" rx="95" ry="18"
                          fill="none" stroke="rgba(255,255,255,0.4)"
                          strokeWidth="1.5" strokeDasharray="6,4"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    </motion.div>
                  )}

                  {/* Feature annotation labels */}
                  <AnimatePresence>
                    {FEATURE_FIXES.map(f => !!featureToggles[f.key] && (
                      <motion.div
                        key={f.key}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="absolute z-20"
                        style={{ top: f.top, left: f.left }}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-full bg-purple-600 border-2 border-white shadow-lg flex items-center justify-center shrink-0">
                            <span className="text-white text-[10px] font-bold">S</span>
                          </div>
                          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-lg">
                            <p className="text-xs font-semibold text-white whitespace-nowrap">{f.label}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Image counter */}
                  <div className="absolute top-3 right-3 z-20 bg-black/50 rounded-full px-2.5 py-1">
                    <p className="text-[11px] text-white/80 font-medium">1 / 10</p>
                  </div>

                  {/* Nav arrows */}
                  <button className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-colors">
                    <ChevronLeft className="h-4 w-4 text-gray-700" />
                  </button>
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-colors">
                    <ChevronRight className="h-4 w-4 text-gray-700" />
                  </button>
                </div>

                {/* Feature toggle switches */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FEATURE_FIXES.map(f => (
                    <div
                      key={f.key}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-4 py-3 transition-all",
                        featureToggles[f.key]
                          ? "bg-white border-purple-200 shadow-sm"
                          : "bg-gray-50 border-gray-200"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium transition-colors",
                        featureToggles[f.key] ? "text-gray-800" : "text-gray-400 line-through"
                      )}>
                        {f.label}
                      </span>
                      <Switch
                        checked={!!featureToggles[f.key]}
                        onCheckedChange={() => toggleFeature(f.key)}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 360 + Video */}
            {showPipeline && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* 360 Spin */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
                  <div className="aspect-[16/9] relative bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-purple-300 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        >
                          <RotateCcw className="h-10 w-10 text-purple-400" />
                        </motion.div>
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-600">
                      Interactive 360° Spin
                    </div>
                    <div className="absolute top-3 right-3 bg-purple-500 text-white rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                      AUTO-GENERATED
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 text-sm">360° Spin View</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Generated from just 4 images. Under 30 seconds processing.
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                        <RotateCcw className="h-3 w-3" /> 36 angles
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" /> 28s processing
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Walkthrough */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
                  <div className="aspect-[16/9] relative bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
                    <Image src={procImg} alt="Video preview" fill className="object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    <button className="relative z-10 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                      <Play className="h-7 w-7 text-gray-900 ml-1" />
                    </button>
                    <div className="absolute bottom-3 left-3 z-10">
                      <p className="text-white text-xs font-semibold">Video Walkthrough</p>
                      <p className="text-white/60 text-[10px]">15 sec · Branded</p>
                    </div>
                    <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                      AUTO-GENERATED
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 text-sm">Video Tour</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-generated branded walkthrough from processed images.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      {["Standard", "Branded", "Social"].map((v, i) => (
                        <span
                          key={v}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all",
                            i === 1 ? "bg-purple-500 text-white border-purple-500" : "bg-white text-gray-500 border-gray-200"
                          )}
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Value cards */}
            {showValue && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-500/10 border-green-500/20">
                    <CardContent className="p-6">
                      <Clock className="h-6 w-6 text-green-400 mb-3" />
                      <p className="text-sm text-green-600">Time to listing-ready</p>
                      <div className="mt-2">
                        <span className="text-sm text-red-400 line-through mr-2">3–7 days</span>
                        <span className="text-3xl font-bold text-green-600">1.2 sec</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-500/10 border-purple-500/20">
                    <CardContent className="p-6">
                      <DollarSign className="h-6 w-6 text-purple-400 mb-3" />
                      <p className="text-sm text-purple-600">Photo editing cost</p>
                      <div className="mt-2">
                        <span className="text-sm text-red-400 line-through mr-2">$300–$570</span>
                        <span className="text-3xl font-bold text-purple-600">$0</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardContent className="p-6">
                      <Sparkles className="h-6 w-6 text-blue-400 mb-3" />
                      <p className="text-sm text-blue-600">Listing quality</p>
                      <div className="mt-2">
                        <span className="text-sm text-red-400 line-through mr-2">{score}/100</span>
                        <span className="text-3xl font-bold text-blue-600">94/100</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={startCascade}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-8 py-3.5 text-sm font-semibold text-white transition-all"
                  >
                    <Wand2 className="h-4 w-4" /> Transform all {inventory.length} vehicles
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── CASCADE ── */}
        {subPhase === "cascade" && (
          <motion.div key="cascade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {cascadeComplete
                  ? `All ${inventory.length} vehicles transformed.`
                  : `Transforming ${cascadeTransformed.size} of ${inventory.length} vehicles…`}
              </p>
              {cascadeComplete && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 mt-1"
                >
                  Total time: 4.2 seconds
                </motion.p>
              )}
            </div>

            {/* Tile grid */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
              {inventory.map((car, i) => {
                const done = cascadeTransformed.has(i) || isCarDone(car)
                const rawThumb = car.lotPhotos[0] || car.vinClonedPhotos[0] || RAW(((i * 3) % 9) + 2)
                const procThumb = car.spynePhotos[0] || car.smartMatchPhotos[0] || PROC(((i * 2) % 8) + 1)
                return (
                  <div
                    key={car.id}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden transition-all duration-300",
                      done ? "ring-2 ring-green-400" : "ring-1 ring-gray-200"
                    )}
                  >
                    <Image
                      src={done ? procThumb : rawThumb}
                      alt={car.model}
                      fill
                      className="object-cover"
                    />
                    {done && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500 drop-shadow" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {cascadeComplete && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center"
              >
                <button
                  onClick={onGoLive}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-8 py-3.5 text-sm font-semibold text-white transition-colors"
                >
                  <Send className="h-4 w-4" /> Go Live — Publish Everywhere
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
