"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, DollarSign } from "lucide-react"

export function HoldingCostTicker({
  startTime,
  stopped,
  monthlyCars,
  holdingCostPerDay,
}: {
  startTime: number | null
  stopped: boolean
  monthlyCars: number
  holdingCostPerDay: number
}) {
  const [cost, setCost] = useState(0)
  const perSecond = (monthlyCars * holdingCostPerDay) / (24 * 60 * 60)

  useEffect(() => {
    if (!startTime || stopped) return
    const interval = setInterval(() => {
      setCost(((Date.now() - startTime) / 1000) * perSecond)
    }, 250)
    return () => clearInterval(interval)
  }, [startTime, stopped, perSecond])

  if (!startTime) return null

  if (stopped) {
    return (
      <div className="flex items-center gap-1.5 text-green-600 text-sm font-mono">
        <CheckCircle2 className="w-4 h-4" />
        <span>Holding cost stopped</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1">
      <DollarSign className="h-3.5 w-3.5 text-red-500" />
      <div className="flex flex-col items-start">
        <span className="text-[9px] text-red-500 leading-none">Burning right now</span>
        <span className="text-sm font-bold text-red-600 font-mono">
          ${cost.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
