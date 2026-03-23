"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDemoStore } from "@/lib/demo-store"

function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0)
  const rafId = useRef<number>(0)
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.floor(target * progress))
      if (progress < 1) {
        rafId.current = requestAnimationFrame(tick)
      }
    }
    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [target, duration])
  return value
}

function useElapsed(startTime: number | null) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!startTime) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [startTime])
  if (!startTime) return { minutes: 0, seconds: 0, totalSeconds: 0 }
  const totalSeconds = Math.floor((now - startTime) / 1000)
  return { minutes: Math.floor(totalSeconds / 60), seconds: totalSeconds % 60, totalSeconds }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12 },
  }),
}

export function ModuleImpact() {
  const { demoStartTime, holdingCostStopped } = useDemoStore()
  const holdingSaved = useCountUp(45448, 2500)
  const elapsed = useElapsed(demoStartTime)
  const [copied, setCopied] = useState(false)

  const holdingLost = (elapsed.totalSeconds * 0.00053 * 50).toFixed(2)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  return (
    <div
      className="-mx-8 -mt-8 -mb-8 px-8 py-12 min-h-[calc(100vh-96px)]"
      style={{ backgroundColor: "#0F0E1A" }}
    >
      {/* Heading */}
      <motion.h1
        className="text-2xl lg:text-3xl font-bold text-white text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Here&apos;s what Spyne would have done for QuickShift Autos — this month.
      </motion.h1>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        {/* Card 1 — Time Saved */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl p-6 border border-white/10"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", borderTopWidth: "4px", borderTopColor: "#a855f7" }}
        >
          <p className="text-gray-400 text-sm">Time Saved</p>
          <p className="text-white text-xl lg:text-2xl font-bold mt-2">4 days → 47 min</p>
          <p className="text-gray-500 text-xs mt-2">Per vehicle. Across 247 cars = 1,632 hrs saved/month</p>
        </motion.div>

        {/* Card 2 — Holding Cost Eliminated */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl p-6 border border-white/10"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", borderTopWidth: "4px", borderTopColor: "#a855f7" }}
        >
          <p className="text-gray-400 text-sm">Holding Cost Eliminated</p>
          <p className="text-gray-400 text-xs mt-1">$46/day x 4 days x 247 cars</p>
          <p className="text-green-400 text-3xl font-bold mt-2">${holdingSaved.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-2">That&apos;s profit you kept</p>
        </motion.div>

        {/* Card 3 — Conversions */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl p-6 border border-white/10"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", borderTopWidth: "4px", borderTopColor: "#a855f7" }}
        >
          <p className="text-gray-400 text-sm">Conversion Impact</p>
          <p className="text-purple-400 text-xl font-bold mt-2">+41% click-to-call</p>
          <p className="text-purple-300 text-lg mt-1">+28% test drives booked</p>
          <p className="text-gray-500 text-xs mt-2">From visual quality alone</p>
        </motion.div>

        {/* Card 4 — Go-Live Speed */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl p-6 border border-white/10"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", borderTopWidth: "4px", borderTopColor: "#a855f7" }}
        >
          <p className="text-gray-400 text-sm">Go-Live Speed</p>
          <p className="text-white text-xl font-bold mt-2">247 vehicles fully live</p>
          <p className="text-green-400 text-lg font-bold mt-1">In &lt; 8 hours</p>
          <p className="text-gray-500 text-xs mt-2">vs 3-7 days manually</p>
        </motion.div>
      </div>

      {/* Timeline comparison */}
      <div className="mt-10 space-y-4">
        <div>
          <p className="text-white text-sm mb-2">Day 0: Arrive → Process → Live on 4 platforms</p>
          <motion.div
            className="h-3 rounded-full bg-purple-600"
            style={{ boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 0.8 }}
          />
        </div>

        <p className="text-gray-600 text-sm text-center">vs</p>

        <div>
          <p className="text-gray-500 text-sm mb-2">Manual: Day 0 → Day 3-7: finally live</p>
          <motion.div
            className="h-3 rounded-full bg-gray-700"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 1.2 }}
          />
        </div>
      </div>

      {/* Holding cost demo timer */}
      <motion.div
        className="mt-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <p className="text-gray-400">
          You sat through this demo for {elapsed.minutes} min {elapsed.seconds} sec.
        </p>
        <p className="text-red-400 text-lg font-bold mt-1">
          A dealer with 50 unprocessed cars lost ${holdingLost}
        </p>
        {holdingCostStopped && (
          <p className="text-green-400 mt-2 flex items-center justify-center gap-2">
            <Check className="h-4 w-4" />
            Holding cost clock: Stopped
          </p>
        )}
      </motion.div>

      {/* CTA section */}
      <div className="mt-12 text-center space-y-5">
        <p className="text-white text-xl font-semibold">Ready to stop losing $46/day per car?</p>

        <div className="flex justify-center gap-4">
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-base font-medium h-auto"
          >
            Book a Live Demo →
          </Button>
          <Button
            variant="outline"
            className="bg-transparent border border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-xl text-base h-auto"
          >
            Start Free Trial
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2">
          <span className="text-gray-500 text-sm">Or share this demo:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="bg-transparent border-white/20 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy link
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
