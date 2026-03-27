"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Smartphone, Camera } from "lucide-react"

const comparisonData = [
  { feature: "Capture time per car", app: "< 5 minutes", traditional: "20–40 minutes", appWins: true },
  { feature: "Equipment needed", app: "Smartphone only", traditional: "DSLR + tripod + lights", appWins: true },
  { feature: "Training required", app: "Built-in shooting guide", traditional: "Hours of training", appWins: true },
  { feature: "Background removal", app: "Automatic (AI)", traditional: "Manual Photoshop", appWins: true },
  { feature: "360° spin creation", app: "4 images → auto 360°", traditional: "Turntable + 36 shots", appWins: true },
  { feature: "Video walkaround", app: "Auto-generated from photos", traditional: "Separate video shoot", appWins: true },
  { feature: "Consistency", app: "100% consistent across inventory", traditional: "Varies by photographer", appWins: true },
  { feature: "Cost per vehicle", app: "Included in plan", traditional: "$15–$50 per vehicle", appWins: true },
  { feature: "Publishing", app: "One-click to all platforms", traditional: "Manual upload per platform", appWins: true },
  { feature: "Turnaround", app: "Minutes", traditional: "1–3 days", appWins: true },
]

export function ModuleAppComparison() {
  const [showPhoneDemo, setShowPhoneDemo] = useState(false)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">Your phone is now your photo studio.</h1>
        <p className="text-gray-500 mt-1 text-sm">See why dealers are switching from traditional photography to the Spyne app.</p>
      </motion.div>

      {/* Phone mockup + traditional side by side */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Spyne App */}
        <Card className="border-purple-200 bg-purple-50/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Spyne App</h3>
              <Badge className="bg-purple-100 text-purple-700 text-xs ml-auto">Recommended</Badge>
            </div>
            {/* Phone mockup */}
            <div className="mx-auto w-44 relative">
              <div className="bg-gray-900 rounded-[2rem] p-2 shadow-xl">
                <div className="bg-white rounded-[1.5rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="h-6 bg-gray-900 flex items-center justify-center">
                    <div className="w-16 h-3 bg-gray-800 rounded-full" />
                  </div>
                  {/* App screen */}
                  <div className="p-3 space-y-2 h-64">
                    <div className="bg-purple-600 text-white text-[10px] text-center py-1 rounded font-medium">
                      Spyne Studio
                    </div>
                    {/* Camera viewfinder */}
                    <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center relative">
                      <div className="border-2 border-dashed border-purple-400 rounded w-3/4 h-3/4 flex items-center justify-center">
                        <span className="text-[8px] text-purple-500">Align car here</span>
                      </div>
                      {/* Guide overlay */}
                      <div className="absolute top-1 left-1 bg-green-500 text-white text-[7px] px-1 rounded">
                        ✓ Good angle
                      </div>
                    </div>
                    {/* Progress */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 h-1 rounded-full",
                            i < 4 ? "bg-purple-500" : "bg-gray-200"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-[8px] text-center text-gray-500">Shot 4 of 8 · Front 3/4</p>
                    {/* Capture button */}
                    <div className="flex justify-center">
                      <div className="w-10 h-10 rounded-full border-4 border-purple-500 bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* App benefits */}
            <div className="mt-4 space-y-2">
              {[
                "AI-guided shooting (tells you exactly where to stand)",
                "Real-time quality checks",
                "Instant background removal",
                "Auto-generates 360° from 4 photos",
                "One-tap publish to all platforms",
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-xs text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traditional */}
        <Card className="border-gray-200 bg-gray-50/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-gray-700">Traditional Photography</h3>
              <Badge variant="outline" className="text-gray-500 text-xs ml-auto">Legacy</Badge>
            </div>
            {/* Equipment illustration */}
            <div className="mx-auto w-44">
              <div className="bg-gray-200 rounded-xl p-4 space-y-3 h-[340px] flex flex-col items-center justify-center">
                <div className="w-20 h-14 bg-gray-300 rounded-lg" />
                <div className="w-1 h-12 bg-gray-400" />
                <div className="w-16 h-2 bg-gray-400 rounded" />
                <div className="flex gap-2 mt-2">
                  <div className="w-6 h-8 bg-gray-300 rounded" />
                  <div className="w-6 h-8 bg-gray-300 rounded" />
                </div>
                <p className="text-[10px] text-gray-500 text-center mt-2">DSLR + Tripod + Lights + Backdrop</p>
              </div>
            </div>
            {/* Traditional pain points */}
            <div className="mt-4 space-y-2">
              {[
                "Requires trained photographer",
                "Inconsistent quality between shoots",
                "No automatic background removal",
                "360° needs expensive turntable + 36 shots",
                "Manual upload to each platform separately",
              ].map((pain, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-xs text-gray-500">{pain}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feature comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Feature</th>
                  <th className="text-left py-3 px-4 font-semibold text-purple-700">Spyne App</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Traditional</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <motion.tr
                    key={row.feature}
                    className="border-b last:border-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 + i * 0.04 }}
                  >
                    <td className="py-2.5 px-4 text-gray-700">{row.feature}</td>
                    <td className="py-2.5 px-4">
                      <span className="text-purple-700 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        {row.app}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-500">{row.traditional}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom stats */}
      <motion.div
        className="grid grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {[
          { value: "85%", label: "Less time per car" },
          { value: "$0", label: "Equipment cost" },
          { value: "100%", label: "Consistency" },
        ].map((stat, i) => (
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
        transition={{ delay: 0.6 }}
      >
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-900">
              <strong>Traditional setup: $5,000+ upfront + $15–$50/car.</strong> Spyne App: your team&apos;s existing phones + included in your plan.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
