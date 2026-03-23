"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DEMO_VEHICLE } from "@/lib/demo-store"

export function ModuleSmartView() {
  const [showAfter, setShowAfter] = useState(false)

  const stats = [
    { value: "+312%", label: "VDP engagement" },
    { value: "+41%", label: "click-to-call" },
    { value: "+28%", label: "test drive bookings" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">What your buyers actually see.</h1>
      </motion.div>

      {/* Browser mockup */}
      <AnimatePresence mode="wait">
        {!showAfter ? (
          <motion.div
            key="before"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Browser chrome — BEFORE */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              {/* Top bar */}
              <div className="h-8 bg-gray-200 rounded-t-xl flex items-center px-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="bg-white rounded px-2 py-0.5 text-xs text-gray-500 ml-3 flex-1">
                  quickshiftautos.co.uk
                </div>
              </div>

              {/* Content area */}
              <div className="bg-white rounded-b-xl p-6 space-y-4">
                {/* Nav placeholder */}
                <div className="h-10 bg-gray-200 rounded" />

                {/* Cramped vehicle listing */}
                <div className="flex gap-4">
                  <div className="w-48 shrink-0">
                    <div className="aspect-[4/3] rounded bg-gray-200" />
                  </div>
                  <div className="space-y-2 pt-1">
                    <p className="text-sm text-gray-600">
                      {DEMO_VEHICLE.year} {DEMO_VEHICLE.make} {DEMO_VEHICLE.model}
                    </p>
                    <p className="text-sm text-gray-400">{DEMO_VEHICLE.color}</p>
                    <p className="text-sm text-gray-500">${DEMO_VEHICLE.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Stat */}
                <p className="text-sm text-red-600">Avg. time on page: 22 seconds</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="after"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {/* Browser chrome — AFTER */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              {/* Top bar */}
              <div className="h-8 bg-gray-200 rounded-t-xl flex items-center px-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="bg-white rounded px-2 py-0.5 text-xs text-gray-500 ml-3 flex-1 flex items-center gap-1.5">
                  quickshiftautos.co.uk (SmartView ✓)
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                </div>
              </div>

              {/* Content area */}
              <div className="bg-white rounded-b-xl p-6 space-y-4">
                {/* Branded nav */}
                <motion.div
                  className="h-10 bg-purple-600 rounded flex items-center px-4"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="text-white text-xs font-medium">QuickShift Autos</span>
                </motion.div>

                {/* Professional vehicle card */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Large image placeholder */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg" />

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {["360° Spin", "Video", "Gallery"].map((label) => (
                      <button
                        key={label}
                        className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${DEMO_VEHICLE.price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {DEMO_VEHICLE.year} {DEMO_VEHICLE.make} {DEMO_VEHICLE.model} · {DEMO_VEHICLE.color}
                      </p>
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      Book Test Drive
                    </Button>
                  </div>

                  {/* Dealership branding */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gray-200" />
                    <span className="text-xs text-gray-500">QuickShift Autos — Verified Dealer</span>
                  </div>
                </motion.div>

                {/* Stat */}
                <p className="text-sm text-green-600 font-bold">Avg. time on page: 4 min 12 sec</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowAfter(!showAfter)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8"
        >
          {showAfter ? "← Show Before" : "Transform Website →"}
        </Button>
      </div>

      {/* 3-stat strip */}
      <motion.div
        className="grid grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
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
              <strong>No website rebuild needed.</strong> SmartView overlays your existing site in real time.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
