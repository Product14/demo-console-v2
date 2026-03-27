"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import type { FormData } from "../page"

const PHOTO_WORKFLOWS = ["in-house", "agency", "mixed", "unknown"]

export function SetupSection({
  formData,
  setFormData,
  onStart,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  onStart: () => void
}) {
  function update(key: keyof FormData, v: string) {
    setFormData((p) => ({ ...p, [key]: v }))
  }

  const monthlyCars = Number(formData.monthlyCars) || 420
  const hcPerDay = Number(formData.holdingCostPerDay) || 45
  const fullPct = Number(formData.fullImageSetPct) || 58
  const invisibleCars = Math.round(monthlyCars * (1 - fullPct / 100))
  const dailyBurn = invisibleCars * hcPerDay

  return (
    <div className="flex items-center justify-center min-h-screen px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 rounded bg-[#6C47FF]" />
            <span className="text-gray-900 font-bold text-xl">spyne</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Start your demo
          </h1>
          <p className="text-gray-500 mt-2">
            Tell us about the dealership to personalize the experience
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5 text-sm md:col-span-2">
              <span className="text-gray-500">Dealer / Group name</span>
              <input
                value={formData.dealerName}
                onChange={(e) => update("dealerName", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-300"
              />
            </label>
            <label className="space-y-1.5 text-sm md:col-span-2">
              <span className="text-gray-500">Dealership URL</span>
              <input
                value={formData.dealerUrl}
                onChange={(e) => update("dealerUrl", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-300"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-gray-500">Rooftop count</span>
              <input
                value={formData.rooftops}
                onChange={(e) => update("rooftops", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-gray-500">Monthly cars listed</span>
              <input
                value={formData.monthlyCars}
                onChange={(e) => update("monthlyCars", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-gray-500">Avg days on lot</span>
              <input
                value={formData.avgDaysOnLot}
                onChange={(e) => update("avgDaysOnLot", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-gray-500">Holding cost / day ($)</span>
              <input
                value={formData.holdingCostPerDay}
                onChange={(e) => update("holdingCostPerDay", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-gray-500">% listings with full image set</span>
              <input
                value={formData.fullImageSetPct}
                onChange={(e) => update("fullImageSetPct", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-gray-500">Photo workflow</span>
              <select
                value={formData.photoWorkflow}
                onChange={(e) => update("photoWorkflow", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900"
              >
                {PHOTO_WORKFLOWS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {dailyBurn > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center"
          >
            <p className="text-sm text-red-800">
              Right now, approximately <strong>{invisibleCars} vehicles</strong> in
              your inventory lack proper media.
              That&apos;s <strong className="text-red-600">${dailyBurn.toLocaleString()}/day</strong> in
              holding cost on invisible inventory.
            </p>
          </motion.div>
        )}

        <button
          onClick={onStart}
          className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-4 text-lg font-semibold text-white transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="h-5 w-5" /> Start Demo
        </button>
      </motion.div>
    </div>
  )
}
