"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowLeft, ImageOff, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScoreRing } from "../components/score-ring"
import type { InventoryCar } from "../page"
import { RAW, qualityScore } from "../page"

interface BoundingBox {
  top: string
  left: string
  width: string
  height: string
  label: string
  aiModel: string
  severity: "high" | "medium" | "low"
  leaderEnd: { top: string; right: string }
}

function getBoxesForIssues(issues: InventoryCar["issues"]): BoundingBox[] {
  const presets: BoundingBox[] = [
    { top: "5%", left: "0%", width: "100%", height: "35%", label: "Distracting background", aiModel: "remove bg car exterior", severity: "high", leaderEnd: { top: "15%", right: "-2%" } },
    { top: "75%", left: "35%", width: "18%", height: "12%", label: "Plate visible", aiModel: "number plate mask", severity: "medium", leaderEnd: { top: "80%", right: "-2%" } },
    { top: "20%", left: "5%", width: "25%", height: "20%", label: "Low quality", aiModel: "super res", severity: "high", leaderEnd: { top: "28%", right: "-2%" } },
    { top: "60%", left: "60%", width: "30%", height: "25%", label: "Watermark / banner", aiModel: "watermark removal", severity: "medium", leaderEnd: { top: "65%", right: "-2%" } },
  ]
  return presets.slice(0, Math.min(issues.length, 4)).map((box, i) => ({
    ...box,
    label: issues[i]?.label ?? box.label,
    aiModel: issues[i]?.aiModel ?? box.aiModel,
    severity: issues[i]?.severity ?? box.severity,
  }))
}

export function VehicleXRaySection({
  car,
  onBack,
  onTransform,
}: {
  car: InventoryCar
  onBack: () => void
  onTransform: () => void
}) {
  const [scanDone, setScanDone] = useState(false)
  const [visibleBoxes, setVisibleBoxes] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [showCta, setShowCta] = useState(false)

  const isNoPhotos = car.category === "no-photos"
  const heroImage = RAW(3)
  const boxes = getBoxesForIssues(car.issues)
  const score = qualityScore(car.issues)
  const carLabel = `${car.year} ${car.make} ${car.model} ${car.trim}`

  useEffect(() => {
    setScanDone(false)
    setVisibleBoxes(0)
    setShowScore(false)
    setShowCta(false)

    if (isNoPhotos) {
      const scoreTimer = setTimeout(() => setShowScore(true), 800)
      const ctaTimer = setTimeout(() => setShowCta(true), 1500)
      return () => {
        clearTimeout(scoreTimer)
        clearTimeout(ctaTimer)
      }
    }

    const scanTimer = setTimeout(() => setScanDone(true), 1800)

    const boxTimers = boxes.map((_, i) =>
      setTimeout(() => setVisibleBoxes(i + 1), 2200 + i * 700)
    )

    const scoreTimer = setTimeout(
      () => setShowScore(true),
      2200 + boxes.length * 700 + 500
    )
    const ctaTimer = setTimeout(
      () => setShowCta(true),
      2200 + boxes.length * 700 + 1200
    )

    return () => {
      clearTimeout(scanTimer)
      boxTimers.forEach(clearTimeout)
      clearTimeout(scoreTimer)
      clearTimeout(ctaTimer)
    }
  }, [car.id, boxes.length, isNoPhotos])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to inventory
        </button>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{carLabel}</p>
          <p className="text-xs text-gray-400">
            Stock #{car.stockNo} · {car.daysOnLot} days on lot · ${car.price.toLocaleString()}
          </p>
        </div>
      </div>

      {isNoPhotos ? (
        <>
          {/* No-photos empty state */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200" style={{ height: "50vh", maxHeight: 500 }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center">
                <ImageOff className="h-10 w-10 text-purple-400" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">No photos on file</p>
                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  This vehicle has zero images — it&apos;s invisible to online buyers.
                  <br />
                  Smart Match will find and generate photos from similar vehicles in seconds.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                  <p className="text-xs font-semibold text-red-600">Critical: Not listed online</p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs font-semibold text-amber-600">${car.holdingCostPerDay}/day holding cost</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Hero image with overlays */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100" style={{ height: "70vh", maxHeight: 700 }}>
            <Image
              src={heroImage}
              alt={carLabel}
              fill
              className="object-cover"
              priority
            />

            {/* Scanning line */}
            <motion.div
              initial={{ top: "0%" }}
              animate={{ top: scanDone ? "100%" : "0%" }}
              transition={{ duration: 1.5, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 z-10"
              style={{
                background: "linear-gradient(90deg, transparent, #6C47FF, transparent)",
                boxShadow: "0 0 12px 2px rgba(108, 71, 255, 0.4)",
              }}
            />

            {/* Bounding boxes */}
            {boxes.map((box, i) =>
              i < visibleBoxes ? (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute z-20"
                  style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
                >
                  <div
                    className={cn(
                      "w-full h-full border-2 border-dashed rounded-lg",
                      box.severity === "high"
                        ? "border-red-400 bg-red-500/5"
                        : box.severity === "medium"
                        ? "border-amber-400 bg-amber-500/5"
                        : "border-gray-400 bg-gray-500/5"
                    )}
                  />
                </motion.div>
              ) : null
            )}

            {/* Labels on the right margin */}
            <div className="absolute top-4 right-4 z-30 space-y-3 max-w-[220px]">
              {boxes.map((box, i) =>
                i < visibleBoxes ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg px-3 py-2"
                  >
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        box.severity === "high" ? "text-red-600" : "text-amber-600"
                      )}
                    >
                      {box.label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      AI: {box.aiModel}
                    </p>
                  </motion.div>
                ) : null
              )}
            </div>
          </div>
        </>
      )}

      {/* Score badge */}
      {showScore && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4"
        >
          <ScoreRing
            value={score}
            size={64}
            stroke={5}
            color={score < 50 ? "text-red-500" : "text-amber-500"}
          />
          <div>
            <p className="text-lg font-bold text-gray-900">
              Media Score: {score}/100
            </p>
            <p className="text-sm text-gray-500">
              {isNoPhotos
                ? "No images — this vehicle is invisible to buyers"
                : `${car.issues.length} issue${car.issues.length !== 1 ? "s" : ""} detected by AI analysis`}
            </p>
          </div>
        </motion.div>
      )}

      {/* CTA */}
      {showCta && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            onClick={onTransform}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-8 py-3.5 text-sm font-semibold text-white transition-colors"
          >
            <Wand2 className="h-4 w-4" /> {isNoPhotos ? "Run Smart Match" : "Transform this vehicle"}
          </button>
        </motion.div>
      )}
    </div>
  )
}
