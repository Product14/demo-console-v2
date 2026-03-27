"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { RotateCcw, Play, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ValueCallout } from "./value-callout"

export function Module360Video() {
  const [activeVariant, setActiveVariant] = useState<"standard" | "branded" | "social">("standard")

  const variants = [
    { id: "standard" as const, label: "Standard" },
    { id: "branded" as const, label: "Branded" },
    { id: "social" as const, label: "Social (9:16)" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">A full spin. A full video. From the images you already have.</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — 360° section */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-gray-700">Input: 8 images</p>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Output: Interactive 360° Spin</p>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-10 h-8 rounded bg-gray-200"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
              />
            ))}
          </div>

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

          <span className="inline-block bg-purple-50 text-purple-600 text-xs px-3 py-1 rounded-full">
            Generated in ~4 minutes
          </span>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-lg">
            Customers viewing 360° stay <strong>3× longer</strong> on VDP
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

          <div className="relative aspect-video rounded-xl bg-gray-900 overflow-hidden flex items-center justify-center">
            <div className="bg-white/20 rounded-full p-3">
              <Play className="h-12 w-12 text-white" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 flex items-center justify-between">
              <span className="text-white text-xs">0:43 walkaround</span>
              <span className="text-white text-xs bg-black/40 px-2 py-0.5 rounded">0:43</span>
            </div>
          </div>

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

          <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-3 rounded-lg">
            Video VDPs convert <strong>49% better</strong> than image-only
          </div>
        </motion.div>
      </div>

      <ValueCallout>
        <strong>Professional video shoot: $400–$800.</strong> Spyne: included. Turnaround: minutes, not weeks.
      </ValueCallout>
    </div>
  )
}
