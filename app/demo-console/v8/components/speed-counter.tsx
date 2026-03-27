"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

export function SpeedCounter({
  running,
  targetMs = 1200,
  onComplete,
}: {
  running: boolean
  targetMs?: number
  onComplete?: () => void
}) {
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)
  const completedRef = useRef(false)

  useEffect(() => {
    if (!running) {
      setElapsed(0)
      setDone(false)
      startRef.current = null
      completedRef.current = false
      return
    }

    startRef.current = performance.now()

    function tick() {
      if (!startRef.current) return
      const t = performance.now() - startRef.current
      const progress = Math.min(t / (targetMs * 1.8), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setElapsed(eased * targetMs)

      if (progress >= 1) {
        setElapsed(targetMs)
        setDone(true)
        if (!completedRef.current) {
          completedRef.current = true
          onComplete?.()
        }
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running, targetMs, onComplete])

  if (!running && !done) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 border border-gray-200 shadow-sm"
    >
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
      )}
      <span className="text-sm font-mono font-bold text-gray-900">
        {(elapsed / 1000).toFixed(1)}s
      </span>
    </motion.div>
  )
}
