"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ExampleMode = "good" | "bad"

const steps = [
  { emoji: "🌤️", label: "Overcast outdoor light", description: "Eliminates harsh shadows", status: "required" as const },
  { emoji: "📐", label: "45° front-left angle first", description: "Establishes primary listing image", status: "required" as const },
  { emoji: "🔄", label: "Complete clockwise walkaround", description: "Enables 360 generation", status: "required" as const },
  { emoji: "🪟", label: "All 4 window angles", description: "Captures interior light", status: "recommended" as const },
  { emoji: "🧹", label: "Clean vehicle before shoot", description: "Reduces AI correction load", status: "recommended" as const },
  { emoji: "🎯", label: "Wheels straight for hero shot", description: "Professional appearance", status: "required" as const },
  { emoji: "🪑", label: "Dashboard + front seats", description: "Interior showcase", status: "required" as const },
  { emoji: "🔧", label: "Boot open + engine bay", description: "Complete documentation", status: "recommended" as const },
]

export function ModuleShootingGuide() {
  const [mode, setMode] = useState<ExampleMode>("good")

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">Better input. Better output. No reshoots.</h1>
      </motion.div>

      {/* Toggle pills */}
      <div className="inline-flex bg-gray-100 rounded-full p-1">
        <button
          onClick={() => setMode("good")}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-medium transition-colors",
            mode === "good"
              ? "bg-green-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          Good Example
        </button>
        <button
          onClick={() => setMode("bad")}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-medium transition-colors",
            mode === "bad"
              ? "bg-red-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          Bad Example
        </button>
      </div>

      {/* Checklist */}
      <div className="space-y-0">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className={cn(
              "flex items-center gap-4 p-4 border-b border-gray-100",
              mode === "bad" && "opacity-60"
            )}
          >
            {/* Step number */}
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 text-sm">
              {i + 1}
            </div>

            {/* Emoji */}
            <span className="text-lg shrink-0">{step.emoji}</span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {step.label}
                {mode === "bad" && (
                  <span className="ml-2 text-red-500 text-xs font-normal">— Not followed</span>
                )}
              </p>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>

            {/* Status dot */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  step.status === "required" ? "bg-green-500" : "bg-amber-500",
                  mode === "bad" && step.status === "required" && "bg-red-500"
                )}
              />
              <span
                className={cn(
                  "text-xs",
                  step.status === "required" ? "text-green-600" : "text-amber-600",
                  mode === "bad" && step.status === "required" && "text-red-600"
                )}
              >
                {step.status === "required" ? "Required" : "Recommended"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Callout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-green-50 p-4 rounded-lg"
      >
        <p className="text-sm text-green-800">
          <strong>Following this guide reduces AI reprocessing requests by 60%</strong> and speeds up go-live by ~47 minutes.
        </p>
      </motion.div>
    </div>
  )
}
