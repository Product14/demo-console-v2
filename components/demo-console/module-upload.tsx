"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, CheckCircle2, AlertTriangle, Clock, Zap, FileImage, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DEMO_VEHICLE } from "@/lib/demo-store"

export function ModuleUpload() {
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [visibleChips, setVisibleChips] = useState(0)

  // Status chips data
  const statusChips = [
    { icon: CheckCircle2, text: "Images received", color: "text-green-600", delay: 0 },
    { icon: CheckCircle2, text: `VIN detected: ${DEMO_VEHICLE.vin.slice(0,10)}…`, color: "text-green-600", delay: 1 },
    { icon: CheckCircle2, text: `Vehicle classified: ${DEMO_VEHICLE.make} ${DEMO_VEHICLE.model} ${DEMO_VEHICLE.year}`, color: "text-green-600", delay: 2 },
    { icon: AlertTriangle, text: "Issues detected: 4 problems found", color: "text-amber-600", delay: 3 },
  ]

  const issues = [
    { label: "Inconsistent backgrounds", detail: "6 images", severity: "high" },
    { label: "Overexposed", detail: "3 images", severity: "high" },
    { label: "Number plate visible", detail: "All exterior shots", severity: "medium" },
    { label: "No branding / dealership overlay", detail: "Missing", severity: "medium" },
  ]

  // Auto-start analysis on mount with full cleanup
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true

    const timers: ReturnType<typeof setTimeout>[] = []
    let progressInterval: ReturnType<typeof setInterval> | null = null

    const startTimer = setTimeout(() => {
      setAnalyzing(true)

      // Animate progress bar
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (progressInterval) clearInterval(progressInterval)
            progressInterval = null
            return 100
          }
          return prev + 2
        })
      }, 50)

      // Stagger status chips
      statusChips.forEach((_, i) => {
        timers.push(setTimeout(() => setVisibleChips(i + 1), 800 + i * 600))
      })

      // Complete
      timers.push(setTimeout(() => {
        setAnalyzing(false)
        setAnalyzed(true)
      }, 3200))
    }, 500)

    return () => {
      clearTimeout(startTimer)
      timers.forEach(clearTimeout)
      if (progressInterval) clearInterval(progressInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">Where every car starts — and where most dealers lose time</h1>
        <p className="mt-1 text-gray-500">The average dealer takes 3–7 days to get a car online. You&apos;re already losing.</p>
      </motion.div>

      {/* Main content — 2 column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left — Upload zone (55%) */}
        <motion.div className="lg:col-span-7 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              {/* Drop zone */}
              <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center bg-gray-50/50">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-3 text-sm font-medium text-gray-600">Drop 32–40 images or a walkaround video</p>
                <p className="mt-1 text-xs text-gray-400">JPG, PNG, WebP, MP4 — up to 50MB</p>
              </div>

              {/* Filmstrip thumbnails */}
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-[72px] h-[52px] rounded-lg shrink-0",
                      analyzed ? "bg-gradient-to-br from-gray-200 to-gray-300" : "bg-gray-200 animate-pulse"
                    )}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="flex items-center gap-1">
                    <FileImage className="h-3 w-3" />
                    Analyzing 38 images…
                  </span>
                  <span>{Math.min(progress, 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-purple-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>

              {/* Status chips */}
              <div className="mt-4 space-y-2">
                {statusChips.map((chip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={i < visibleChips ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className={cn("flex items-center gap-2 text-sm", chip.color)}
                  >
                    <chip.icon className="h-4 w-4 shrink-0" />
                    <span>{chip.text}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right — Issues panel (45%) */}
        <motion.div
          className="lg:col-span-5 space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={analyzed ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-red-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold text-gray-900">Issues Detected</h3>
              </div>
              <div className="space-y-3">
                {issues.map((issue, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-red-50/50"
                  >
                    <span className="text-red-500 mt-0.5">✕</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{issue.label}</p>
                      <p className="text-xs text-gray-500">{issue.detail}</p>
                    </div>
                    <Badge variant="outline" className={cn("text-xs", issue.severity === "high" ? "border-red-300 text-red-600" : "border-amber-300 text-amber-600")}>
                      {issue.severity}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Holding cost alert */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    This car has been sitting for {DEMO_VEHICLE.daysNotLive} days.
                  </p>
                  <p className="text-sm text-amber-800 mt-0.5">
                    You&apos;ve already lost <span className="font-bold">${DEMO_VEHICLE.totalHoldingLoss}</span> in holding cost.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom value callout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={analyzed ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-900">
                Without processing, this car won&apos;t rank in the top 10 on AutoTrader. It&apos;s currently <strong>#{DEMO_VEHICLE.marketRank} of 20</strong>.
              </p>
            </div>
            <Badge className="bg-purple-600 hover:bg-purple-700 text-white shrink-0">
              Fix all automatically →
            </Badge>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
