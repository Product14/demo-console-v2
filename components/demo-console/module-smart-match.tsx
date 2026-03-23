"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, CheckCircle2, Loader2, ImageIcon, Zap, ArrowRight, Clock, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DEMO_VEHICLE } from "@/lib/demo-store"

export function ModuleSmartMatch() {
  const [isMatching, setIsMatching] = useState(false)
  const [matched, setMatched] = useState(false)
  const [matchStep, setMatchStep] = useState(0)

  const matchSteps = [
    { text: "Scanning library…", icon: Loader2 },
    { text: "847 similar vehicles found", icon: CheckCircle2 },
    { text: "Selecting best match…", icon: Loader2 },
    { text: `${DEMO_VEHICLE.matchConfidence}% confidence match ✓`, icon: CheckCircle2 },
  ]

  const matchTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  function startMatch() {
    setIsMatching(true)
    setMatchStep(0)

    // Clear any previous timers
    matchTimers.current.forEach(clearTimeout)
    matchTimers.current = [
      setTimeout(() => setMatchStep(1), 500),
      setTimeout(() => setMatchStep(2), 1000),
      setTimeout(() => setMatchStep(3), 1500),
      setTimeout(() => {
        setMatchStep(4)
        setIsMatching(false)
        setMatched(true)
      }, 2000),
    ]
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">
          No car? No problem. Go live before it arrives.
        </h1>
        <p className="mt-1 text-gray-500">
          Smart Match finds identical vehicles in our 10M+ image library and clones their media instantly.
        </p>
      </motion.div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: VIN Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle VIN
                </label>
                <div className="mt-2 relative">
                  <input
                    type="text"
                    readOnly
                    value={DEMO_VEHICLE.vin}
                    className="w-full font-mono text-lg px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>{DEMO_VEHICLE.year} {DEMO_VEHICLE.make} {DEMO_VEHICLE.model}</p>
                <p>{DEMO_VEHICLE.color}</p>
              </div>

              <Button
                onClick={startMatch}
                disabled={isMatching || matched}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isMatching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Matching…
                  </>
                ) : matched ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Matched
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Match Now
                  </>
                )}
              </Button>

              {/* Progress steps */}
              <div className="space-y-2 min-h-[120px]">
                {matchSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={
                      i < matchStep
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: -10 }
                    }
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    {i === matchStep - 1 && isMatching ? (
                      <Loader2 className="h-4 w-4 text-purple-600 animate-spin shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    )}
                    <span className="text-gray-700">{step.text}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Col 2: Your Vehicle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Your Vehicle</h3>
              <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-10 w-10 text-gray-300 mx-auto" />
                  <p className="mt-2 text-xs text-gray-400">No images yet</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-red-300 text-red-600 text-xs">
                  0 images available
                </Badge>
              </div>
              <p className="text-xs text-gray-500">Not yet shot</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Col 3: Matched Vehicle */}
        <AnimatePresence>
          {matched ? (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            >
              <Card className="relative overflow-hidden">
                {/* Animated purple shimmer border */}
                <div
                  className="absolute inset-0 rounded-xl p-[2px]"
                  style={{
                    background:
                      "linear-gradient(90deg, #6C47FF, #a78bfa, #6C47FF, #a78bfa)",
                    backgroundSize: "300% 100%",
                    animation: "shimmer 2s linear infinite",
                  }}
                >
                  <div className="h-full w-full rounded-[10px] bg-white" />
                </div>
                <CardContent className="relative p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Matched Vehicle
                  </h3>
                  <div className="aspect-[4/3] rounded-xl bg-purple-50 relative overflow-hidden flex items-center justify-center">
                    {/* Stacked offset tiles */}
                    <div className="relative w-3/4 h-3/4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.15 }}
                          className="absolute rounded-lg bg-purple-100 border border-purple-200 shadow-sm"
                          style={{
                            width: "85%",
                            height: "60%",
                            top: `${i * 15}%`,
                            left: `${i * 8}%`,
                            zIndex: 3 - i,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      {DEMO_VEHICLE.matchConfidence}% match
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>38 images cloned</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-dashed">
                <CardContent className="p-6 flex items-center justify-center h-full min-h-[300px]">
                  <div className="text-center">
                    <Search className="h-8 w-8 text-gray-300 mx-auto" />
                    <p className="mt-2 text-sm text-gray-400">
                      Match result will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Before/After comparison strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={matched ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Before */}
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <h3 className="text-sm font-semibold text-red-900">Before — Traditional</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-100/50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-900">Time to go live</span>
                </div>
                <span className="text-sm font-bold text-red-700">3–7 days</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-100/50">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-900">Cost</span>
                </div>
                <span className="text-sm font-bold text-red-700">$350–$600 shoot</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* After */}
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <h3 className="text-sm font-semibold text-green-900">After — Smart Match</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-100/50">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-900">Time to go live</span>
                </div>
                <span className="text-sm font-bold text-green-700">&lt; 15 min</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-100/50">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-900">Cost</span>
                </div>
                <span className="text-sm font-bold text-green-700">$0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Value callout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={matched ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Zap className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-900">
              QuickShift Autos could have saved{" "}
              <span className="font-bold">${DEMO_VEHICLE.totalHoldingLoss}</span> on
              just this one car.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Inline shimmer keyframe */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
      `}</style>
    </div>
  )
}
