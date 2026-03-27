"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DEMO_VEHICLE } from "@/lib/demo-store"

function useCountUp(target: number, duration: number = 1500, delay: number = 0) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = Date.now()
      const interval = setInterval(() => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(eased * target))
        if (progress >= 1) clearInterval(interval)
      }, 16)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, duration, delay])
  return value
}

function ScoreRing({ score, label, color, delay }: { score: number; label: string; color: string; delay: number }) {
  const animatedScore = useCountUp(score, 1200, delay)
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (animatedScore / 100) * circumference

  const gradeColor = score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-600" : "text-red-600"
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : "D"

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.4 }}
    >
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="48" cy="48" r="40" fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{animatedScore}</span>
          <span className={cn("text-xs font-bold", gradeColor)}>{grade}</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700 mt-2">{label}</p>
    </motion.div>
  )
}

const websiteFactors = [
  { label: "Image quality", score: 94, max: "Excellent", desc: "HD images with consistent backgrounds" },
  { label: "Rich media", score: 100, max: "Complete", desc: "360° spin + video walkaround included" },
  { label: "Page load speed", score: 88, max: "Fast", desc: "Optimized formats & responsive sizing" },
  { label: "Mobile experience", score: 91, max: "Excellent", desc: "Touch-friendly gallery, mobile-first layout" },
  { label: "SEO readiness", score: 85, max: "Strong", desc: "Proper alt text, structured data, meta tags" },
  { label: "Call-to-action clarity", score: 92, max: "Excellent", desc: "Prominent CTAs, finance widget, booking" },
]

const mediaFactors = [
  { label: "Background consistency", score: 96, max: "Excellent", desc: "Uniform studio backgrounds across inventory" },
  { label: "Color accuracy", score: 93, max: "Excellent", desc: "Auto color normalization applied" },
  { label: "Angle coverage", score: 90, max: "Complete", desc: "All required angles captured (38 images)" },
  { label: "Compliance", score: 100, max: "Compliant", desc: "Plates masked, GDPR ready" },
  { label: "Enhancement quality", score: 95, max: "Excellent", desc: "Shadow, reflection, tilt all corrected" },
  { label: "Video quality", score: 88, max: "Strong", desc: "HD walkaround + branded variant" },
]

export function ModuleScores() {
  const [activeTab, setActiveTab] = useState<"website" | "media">("website")
  const factors = activeTab === "website" ? websiteFactors : mediaFactors
  const overallWebsite = Math.round(websiteFactors.reduce((a, b) => a + b.score, 0) / websiteFactors.length)
  const overallMedia = Math.round(mediaFactors.reduce((a, b) => a + b.score, 0) / mediaFactors.length)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">Your listing quality, scored.</h1>
        <p className="text-gray-500 mt-1 text-sm">Real-time quality grades for your website presence and media assets.</p>
      </motion.div>

      {/* Score rings */}
      <motion.div
        className="flex justify-center gap-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ScoreRing score={overallWebsite} label="Website Score" color="#6C47FF" delay={200} />
        <ScoreRing score={overallMedia} label="Media Score" color="#10B981" delay={500} />
        <ScoreRing score={Math.round((overallWebsite + overallMedia) / 2)} label="Overall" color="#F59E0B" delay={800} />
      </motion.div>

      {/* Tab selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="inline-flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("website")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              activeTab === "website" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            🌍 Website Score Breakdown
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              activeTab === "media" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            📸 Media Score Breakdown
          </button>
        </div>
      </motion.div>

      {/* Factor breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {factors.map((factor, i) => (
          <motion.div
            key={`${activeTab}-${factor.label}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.06 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{factor.label}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        "text-xs",
                        factor.score >= 90 ? "bg-green-100 text-green-700" :
                        factor.score >= 80 ? "bg-blue-100 text-blue-700" :
                        factor.score >= 70 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      )}
                    >
                      {factor.max}
                    </Badge>
                    <span className="text-sm font-bold text-gray-900">{factor.score}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      factor.score >= 90 ? "bg-green-500" :
                      factor.score >= 80 ? "bg-blue-500" :
                      factor.score >= 70 ? "bg-amber-500" :
                      "bg-red-500"
                    )}
                    initial={{ width: "0%" }}
                    animate={{ width: `${factor.score}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{factor.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-5">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-3">Industry Benchmark</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Average Dealer</p>
                <p className="text-2xl font-bold text-red-400">47</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Top 10% Dealers</p>
                <p className="text-2xl font-bold text-amber-400">78</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">You (with Spyne)</p>
                <p className="text-2xl font-bold text-green-400">{Math.round((overallWebsite + overallMedia) / 2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <strong>Dealers scoring 80+ convert 2.4× more leads.</strong> Spyne gets you there automatically — no manual optimization needed.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
