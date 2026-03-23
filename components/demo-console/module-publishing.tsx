"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useDemoStore, DEMO_VEHICLE } from "@/lib/demo-store"

interface Platform {
  emoji: string
  name: string
  defaultOn: boolean
}

const platforms: Platform[] = [
  { emoji: "🌍", name: "Dealer Website", defaultOn: true },
  { emoji: "🚗", name: "AutoTrader", defaultOn: true },
  { emoji: "📘", name: "Facebook Marketplace", defaultOn: true },
  { emoji: "🏷️", name: "Cars.com", defaultOn: true },
  { emoji: "📸", name: "Instagram Ads", defaultOn: false },
  { emoji: "📢", name: "Google Ads", defaultOn: false },
]

export function ModulePublishing() {
  const [toggles, setToggles] = useState<boolean[]>(platforms.map((p) => p.defaultOn))
  const [isPublished, setIsPublished] = useState(false)
  const stopHoldingCost = useDemoStore((s) => s.stopHoldingCost)

  const activePlatformCount = toggles.filter(Boolean).length

  function handleToggle(index: number) {
    if (isPublished) return
    setToggles((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  function handlePublish() {
    setIsPublished(true)
    useDemoStore.getState().stopHoldingCost()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">One click. Live everywhere.</h1>
      </motion.div>

      {/* Vehicle status card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="text-center">
          <CardContent className="p-5 space-y-2">
            <p className="text-lg font-semibold text-gray-900">
              {DEMO_VEHICLE.year} {DEMO_VEHICLE.make} {DEMO_VEHICLE.model} — Processing Complete ✓
            </p>
            <Badge className="bg-green-100 text-green-700 border-green-300">Ready to Publish</Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Destination tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform, i) => (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
          >
            <Card className="relative">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {platform.emoji} {platform.name}
                  </span>
                  {/* Toggle switch */}
                  <button
                    onClick={() => handleToggle(i)}
                    className={cn(
                      "relative w-10 h-5 rounded-full transition-colors",
                      toggles[i] ? "bg-purple-600" : "bg-gray-200"
                    )}
                  >
                    <motion.div
                      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                      animate={{ left: toggles[i] ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                <p className={cn("text-xs", toggles[i] ? "text-green-600" : "text-gray-400")}>
                  {toggles[i] ? "Will go live instantly" : "Not scheduled"}
                </p>

                {/* Published checkmark */}
                {isPublished && toggles[i] && (
                  <motion.div
                    className="absolute top-3 right-14"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: i * 0.15 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Timeline visual */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Purple bar */}
        <div className="relative rounded-lg bg-purple-100 px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-600 rounded-full relative"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, delay: 0.5 }}
              >
                {/* Progress dots */}
                {[20, 40, 60, 80, 100].map((pos) => (
                  <div
                    key={pos}
                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-purple-600 rounded-full"
                    style={{ left: `${pos}%`, transform: "translate(-50%, -50%)" }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
          <p className="text-xs font-medium text-purple-800 shrink-0">
            Right now → Live on {activePlatformCount} platforms in &lt; 2 minutes
          </p>
        </div>

        {/* Gray bar */}
        <div className="rounded-lg bg-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 bg-gray-300 rounded-full" />
          </div>
          <p className="text-xs font-medium text-gray-500 shrink-0">
            Manual process → 2–3 days of emails, uploads, formatting
          </p>
        </div>
      </motion.div>

      {/* Big CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={handlePublish}
          disabled={isPublished}
          className={cn(
            "w-full py-3 text-base font-semibold transition-colors",
            isPublished
              ? "bg-green-600 hover:bg-green-600 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          )}
        >
          {isPublished ? "Published ✓" : "Publish to All Active Platforms"}
        </Button>
      </motion.div>

      {/* Value callout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-900">
              <strong>Your car is now market-ready, branded, and live.</strong> The ${DEMO_VEHICLE.holdingCostPerDay}/day clock stops here.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
