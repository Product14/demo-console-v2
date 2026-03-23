"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { RotateCcw, Play, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function Module360Video() {
  const [activeVariant, setActiveVariant] = useState<"standard" | "branded" | "social">("standard")

  const variants = [
    { id: "standard" as const, label: "Standard" },
    { id: "branded" as const, label: "Branded" },
    { id: "social" as const, label: "Social (9:16)" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">A full spin. A full video. From the images you already have.</h1>
      </motion.div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — 360° section */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Input row */}
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-gray-700">Input: 8 images</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-10 h-8 rounded bg-gray-200" />
              ))}
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 shrink-0" />
          </div>

          <p className="text-sm font-medium text-gray-700">Output: Interactive 360° Spin</p>

          {/* 360 placeholder */}
          <div className="relative aspect-square rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/30 flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <RotateCcw className="h-12 w-12 text-purple-400" />
            </motion.div>
            <p className="mt-3 text-purple-600 font-medium text-sm">360° Preview</p>
            <Badge className="absolute top-3 right-3 bg-purple-600 text-white text-xs">HD</Badge>
          </div>

          {/* Chip */}
          <span className="inline-block bg-purple-50 text-purple-600 text-xs px-3 py-1 rounded-full">
            Generated in ~4 minutes
          </span>

          {/* Stat card */}
          <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-lg">
            Customers viewing 360° stay 3× longer on VDP
          </div>
        </motion.div>

        {/* Right — Video section */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm font-medium text-gray-700">Input: Same 38 images</p>

          {/* Video player placeholder */}
          <div className="relative aspect-video rounded-xl bg-gray-900 overflow-hidden flex items-center justify-center">
            <div className="bg-white/20 rounded-full p-3">
              <Play className="h-12 w-12 text-white" />
            </div>
            {/* Bottom overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 flex justify-end">
              <span className="text-white text-xs bg-black/40 px-2 py-0.5 rounded">0:43</span>
            </div>
          </div>

          {/* Variant chips */}
          <div className="flex gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveVariant(v.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  activeVariant === v.id
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Stat card */}
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-3 rounded-lg">
            Video VDPs convert 49% better than image-only
          </div>
        </motion.div>
      </div>

      {/* Value callout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-900">
              <strong>Professional video shoot: $400–$800.</strong> Spyne: included. Turnaround: minutes, not weeks.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
