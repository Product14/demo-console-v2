"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DEMO_VEHICLE } from "@/lib/demo-store"
import { ValueCallout } from "./value-callout"

function BrowserChrome({ url, children, accent }: { url: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm h-full">
      <div className="h-8 bg-gray-200 flex items-center px-3 gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="bg-white rounded px-2 py-0.5 text-xs text-gray-500 flex-1 flex items-center gap-1.5">
          {url}
          {accent && <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />}
        </div>
      </div>
      <div className="bg-white p-5 space-y-4">{children}</div>
    </div>
  )
}

export function ModuleSmartView() {
  const stats = [
    { value: "+312%", label: "VDP engagement" },
    { value: "+41%", label: "click-to-call" },
    { value: "+28%", label: "test drive bookings" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">What your buyers actually see.</h1>
      </motion.div>

      {/* Side-by-side browser mockups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BEFORE panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative"
        >
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Before Spyne</p>
          <div className="opacity-80 saturate-50">
            <BrowserChrome url="quickshiftautos.co.uk">
              <div className="h-10 bg-gray-200 rounded" />

              <div className="flex gap-4">
                <div className="w-40 shrink-0">
                  <div className="aspect-[4/3] rounded bg-gray-200" />
                </div>
                <div className="space-y-2 pt-1 min-w-0">
                  <p className="text-sm text-gray-600">
                    {DEMO_VEHICLE.year} {DEMO_VEHICLE.make} {DEMO_VEHICLE.model}
                  </p>
                  <p className="text-xs text-gray-400">{DEMO_VEHICLE.color}</p>
                  <p className="text-sm text-gray-500">${DEMO_VEHICLE.price.toLocaleString()}</p>
                </div>
              </div>

              <p className="text-sm text-red-600 font-medium">
                Avg. time on page: 22 seconds
              </p>
            </BrowserChrome>
          </div>
        </motion.div>

        {/* AFTER panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">After Spyne</p>
          <BrowserChrome url="quickshiftautos.co.uk (SmartView ✓)" accent>
            <motion.div
              className="h-10 bg-purple-600 rounded flex items-center px-4"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-white text-xs font-medium">QuickShift Autos</span>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="aspect-[16/10] bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg" />

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

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-gray-900">
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

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gray-200" />
                <span className="text-xs text-gray-500">QuickShift Autos — Verified Dealer</span>
              </div>

              <p className="text-sm text-green-600 font-bold">
                Avg. time on page: 4 min 12 sec
              </p>
            </motion.div>
          </BrowserChrome>
        </motion.div>
      </div>

      {/* 3-stat strip */}
      <motion.div
        className="grid grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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

      <ValueCallout delay={0.6}>
        <strong>No website rebuild needed.</strong> SmartView overlays your existing site in real time.
      </ValueCallout>
    </div>
  )
}
