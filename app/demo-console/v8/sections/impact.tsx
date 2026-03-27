"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  BarChart3, Camera, ChevronDown, ExternalLink, MessageSquare,
  RotateCcw, Send, Shield, Sparkles, Zap,
} from "lucide-react"
import type { FormData, InventoryCar } from "../page"
import { OBJECTION_SNIPPETS } from "../page"

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start = 0
    const startTime = performance.now()
    function tick() {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return value
}

const AI_CAPABILITIES = [
  { title: "Smart Intake", chapter: "Ch. 1", desc: "Quality gating at capture, not after upload", models: 16, icon: Camera },
  { title: "Studio Finish", chapter: "Ch. 4–5", desc: "BG removal + placement in under 1 second", models: 18, icon: Sparkles },
  { title: "Image Intelligence", chapter: "Ch. 6", desc: "Exposure, tilt, haze correction", models: 10, icon: Zap },
  { title: "Compliance", chapter: "Ch. 7", desc: "Plate masking, watermark removal", models: 6, icon: Shield },
  { title: "360 + Video", chapter: "Ch. 13–15", desc: "4 images to full spin. Under 30 seconds.", models: 14, icon: RotateCcw },
  { title: "Media Scoring", chapter: "Ch. 18", desc: "Score every listing before publish", models: 3, icon: BarChart3 },
]

export function ImpactSection({
  formData,
  inventory,
  totalIssues,
  vinClonedCount,
  noPhotosCount,
}: {
  formData: FormData
  inventory: InventoryCar[]
  totalIssues: number
  vinClonedCount: number
  noPhotosCount: number
}) {
  const [openObjection, setOpenObjection] = useState<number | null>(null)

  const monthlyCars = Number(formData.monthlyCars) || 420
  const hcPerDay = Number(formData.holdingCostPerDay) || 45
  const fullPct = Number(formData.fullImageSetPct) || 58
  const rooftopCount = Number(formData.rooftops) || 1
  const avgDaysOnLot = Number(formData.avgDaysOnLot) || 42
  const daysSaved = Math.min(avgDaysOnLot, 5)
  const annualSavings = monthlyCars * 12 * hcPerDay * daysSaved
  const costPerVehicle = 350
  const editingCostSaved = monthlyCars * 12 * costPerVehicle

  const animatedSavings = useCountUp(annualSavings, 2000)
  const totalModels = AI_CAPABILITIES.reduce((s, c) => s + c.models, 0)

  return (
    <div className="space-y-12 pb-12">
      {/* Hero stat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Projected Annual Impact
        </p>
        <p className="text-6xl font-bold text-gray-900 tracking-tight">
          ${animatedSavings.toLocaleString()}
        </p>
        <p className="text-gray-500 mt-2 text-lg">
          recovered from holding cost and merchandising efficiency
        </p>
      </motion.div>

      {/* 4 ROI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Annual holding cost recovered", value: `$${Math.round(annualSavings / 1000)}K`, color: "text-green-600", bg: "bg-green-500/10 border-green-500/20" },
          { label: "Photo editing cost eliminated", value: `$${Math.round(editingCostSaved / 1000)}K`, color: "text-purple-600", bg: "bg-purple-500/10 border-purple-500/20" },
          { label: "Days reclaimed per vehicle", value: `${daysSaved} days`, color: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/20", strike: `${avgDaysOnLot} days` },
          { label: "Quality score improvement", value: "94/100", color: "text-green-600", bg: "bg-green-500/10 border-green-500/20", strike: "38/100" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className={cn("rounded-2xl border p-5", card.bg)}
          >
            <p className="text-xs text-gray-500 mb-2">{card.label}</p>
            {card.strike && (
              <p className="text-sm text-red-400 line-through">{card.strike}</p>
            )}
            <p className={cn("text-2xl font-bold", card.color)}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Financial formula */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-4"
      >
        <div className="flex items-center justify-center gap-3 text-sm text-gray-700 font-mono flex-wrap">
          <span className="font-bold">{monthlyCars}</span>
          <span className="text-gray-400">cars/mo</span>
          <span className="text-gray-300">×</span>
          <span className="font-bold">${hcPerDay}</span>
          <span className="text-gray-400">/day</span>
          <span className="text-gray-300">×</span>
          <span className="font-bold">{daysSaved}</span>
          <span className="text-gray-400">days saved</span>
          <span className="text-gray-300">×</span>
          <span className="text-gray-400">12 mo</span>
          <span className="text-gray-300">=</span>
          <span className="font-bold text-green-600">${annualSavings.toLocaleString()}</span>
          <span className="text-gray-400">/year</span>
        </div>
      </motion.div>

      {/* AI Capability grid */}
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            What ran under the hood
          </p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {totalModels} AI models processed your inventory
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {AI_CAPABILITIES.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + i * 0.1 }}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <cap.icon className="h-4 w-4 text-purple-500" />
                </div>
                <span className="text-[10px] text-gray-400 font-mono">{cap.chapter}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{cap.title}</p>
              <p className="text-xs text-gray-500 mt-1">{cap.desc}</p>
              <p className="text-xs font-mono text-purple-500 mt-2">{cap.models} AI models</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Executive Briefing */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Executive Briefing</p>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-3 text-sm text-gray-700">
          <p>Your <strong>{rooftopCount}</strong> rooftop{rooftopCount > 1 ? "s" : ""} list <strong>{monthlyCars}</strong> vehicles monthly at <strong>${hcPerDay}/day</strong> holding cost.</p>
          <p><strong>{100 - fullPct}%</strong> of active inventory has incomplete or unusable media — invisible to online buyers.</p>
          <p>Playbook standard: recon-to-frontline-live under 3 days. Current average: <strong>{avgDaysOnLot} days</strong>.</p>
          <p>Studio AI closes this gap on Day 0. Projected recovery: <strong className="text-green-600">${annualSavings.toLocaleString()}/year</strong> from holding cost alone.</p>
          <p>45+ day aged inventory risk drops when every unit is merchandised within hours of acquisition.</p>
        </div>
      </div>

      {/* Objection handling */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-purple-500" />
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Objection Handling</p>
        </div>
        <div className="space-y-2">
          {OBJECTION_SNIPPETS.map((obj, i) => (
            <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenObjection(openObjection === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-sm font-medium text-gray-900">&ldquo;{obj.objection}&rdquo;</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", openObjection === i && "rotate-180")} />
              </button>
              {openObjection === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="border-t border-gray-200 px-5 py-4 space-y-3"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Response</p>
                    <p className="text-sm text-gray-700">{obj.response}</p>
                  </div>
                  <div className="rounded-lg border-l-2 border-l-purple-400 bg-purple-50/50 px-3 py-2">
                    <p className="text-xs">
                      <span className="font-medium text-purple-600">What to say:</span>{" "}
                      <span className="text-gray-700">{obj.whatToSay}</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="rounded-2xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 p-10 text-center space-y-4"
      >
        <p className="text-3xl font-bold text-gray-900 tracking-tight">
          From lot photo to live listing.<br />Under 2 seconds.
        </p>
        <p className="text-gray-500 text-lg">No photographer. No editor. No waiting.</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <button className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-3 text-sm font-semibold text-white transition-colors">
            <Send className="h-4 w-4" /> Schedule Your Live Pilot
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 hover:border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors">
            <ExternalLink className="h-4 w-4" /> Share This Report
          </button>
        </div>
      </motion.div>
    </div>
  )
}
