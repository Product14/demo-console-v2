"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  useDemoStore,
  getModulesForPersona,
  PERSONA_LABELS,
  STAGE_LABELS,
  type Persona,
  type VehicleStage,
} from "@/lib/demo-store"
import {
  Upload,
  Zap,
  Wand2,
  RotateCcw,
  Megaphone,
  Palette,
  Send,
  Monitor,
  Camera,
  Image,
  Box,
  Trophy,
  CheckCircle,
  RotateCw,
  Car,
  ChevronRight,
  Database,
  LayoutDashboard,
  Smartphone,
  BarChart3,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  upload: Upload,
  zap: Zap,
  "wand-2": Wand2,
  "rotate-ccw": RotateCcw,
  megaphone: Megaphone,
  palette: Palette,
  send: Send,
  monitor: Monitor,
  camera: Camera,
  image: Image,
  box: Box,
  trophy: Trophy,
  database: Database,
  layout: LayoutDashboard,
  smartphone: Smartphone,
  "bar-chart": BarChart3,
}

const STAGE_ORDER: VehicleStage[] = ["raw", "uploaded", "matched", "enhanced", "media-ready", "campaign-set", "published", "live"]

// Module → what vehicle stage it advances to when completed
const MODULE_STAGE_MAP: Record<string, VehicleStage> = {
  upload: "uploaded",
  "smart-match": "matched",
  "ai-enhancements": "enhanced",
  "360-video": "media-ready",
  "smart-campaign": "campaign-set",
  "media-kit": "campaign-set",
  publishing: "published",
  smartview: "live",
  impact: "live",
}

// ─── Holding Cost Ticker (enhanced) ───

function HoldingCostTicker() {
  const demoStartTime = useDemoStore((s) => s.demoStartTime)
  const holdingCostStopped = useDemoStore((s) => s.holdingCostStopped)
  const [cost, setCost] = React.useState(0)
  const DAILY_HOLDING_COST_PER_CAR = 80
  const UNSOLD_CARS_ON_LOT = 300
  const DAILY_LOT_HOLDING_COST = DAILY_HOLDING_COST_PER_CAR * UNSOLD_CARS_ON_LOT
  const HOLDING_COST_PER_SECOND = DAILY_LOT_HOLDING_COST / (24 * 60 * 60)

  React.useEffect(() => {
    if (!demoStartTime || holdingCostStopped) return
    const interval = setInterval(() => {
      const elapsed = (Date.now() - demoStartTime) / 1000
      setCost(elapsed * HOLDING_COST_PER_SECOND)
    }, 250)
    return () => clearInterval(interval)
  }, [demoStartTime, holdingCostStopped, HOLDING_COST_PER_SECOND])

  if (holdingCostStopped) {
    return (
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-mono font-semibold"
      >
        <CheckCircle className="w-4 h-4" />
        Clock stopped ✓
      </motion.div>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1">
      <span className="text-sm">💸</span>
      <div className="flex flex-col items-start">
        <span className="text-red-700 font-mono text-sm font-bold leading-tight">
          ${cost.toFixed(2)}
        </span>
        <span className="text-[9px] text-red-500 leading-none">
          holding cost accumulating
        </span>
      </div>
    </div>
  )
}

// ─── Vehicle Journey Timeline ───

function VehicleJourney() {
  const stage = useDemoStore((s) => s.vehicleStage)
  const currentIdx = STAGE_ORDER.indexOf(stage)

  const milestones = [
    { stage: "raw" as const, label: "Raw", icon: "📦" },
    { stage: "uploaded" as const, label: "Analyzed", icon: "🔍" },
    { stage: "enhanced" as const, label: "Enhanced", icon: "✨" },
    { stage: "published" as const, label: "Published", icon: "🚀" },
    { stage: "live" as const, label: "Live", icon: "🟢" },
  ]

  return (
    <div className="flex items-center gap-1 px-4 py-2.5 bg-gray-50 border-b">
      <Car className="w-4 h-4 text-gray-400 mr-1" />
      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mr-2">Vehicle:</span>
      {milestones.map((m, i) => {
        const mIdx = STAGE_ORDER.indexOf(m.stage)
        const isReached = currentIdx >= mIdx
        const isCurrent = stage === m.stage
        return (
          <React.Fragment key={m.stage}>
            {i > 0 && (
              <div className={cn("w-6 h-0.5 rounded-full transition-colors duration-500", isReached ? "bg-purple-400" : "bg-gray-200")} />
            )}
            <motion.div
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all duration-500",
                isCurrent && "bg-purple-100 text-purple-700 ring-1 ring-purple-300",
                isReached && !isCurrent && "text-green-600",
                !isReached && "text-gray-400"
              )}
              animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs">{m.icon}</span>
              {m.label}
            </motion.div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Context Banner (shows what just happened) ───

const MODULE_CONTEXT: Record<string, string> = {
  upload: "",
  "smart-match": "38 images analyzed with 4 issues detected → now let's get media without shooting.",
  "ai-enhancements": "Media matched at 98.7% confidence → now let's make it retail-ready.",
  "360-video": "All corrections applied, backgrounds swapped → now let's create immersive media.",
  "smart-campaign": "360° spin and video generated → now let's turn this into a marketing machine.",
  "media-kit": "Campaign configured for 247 vehicles → now let's inject your brand.",
  publishing: "Brand assets applied across inventory → now let's go live.",
  smartview: "Published to 4 platforms → let's see what buyers actually experience.",
  "shooting-guide": "SmartView activated → here's how to get even better input next time.",
  backgrounds: "Guide reviewed → explore the full background library.",
  "3d-view": "Backgrounds configured → let's go 3D.",
  impact: "Every capability deployed → here's the bottom-line impact.",
}

function ContextBanner({ moduleId }: { moduleId: string }) {
  const text = MODULE_CONTEXT[moduleId]
  if (!text) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
      className="bg-purple-50 border-b border-purple-100 px-6 py-2"
    >
      <p className="text-xs text-purple-700 flex items-center gap-1.5">
        <ChevronRight className="w-3 h-3" />
        {text}
      </p>
    </motion.div>
  )
}

// ─── Layout ───

export default function V3PersonaLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ persona: string }>
}) {
  const { persona: personaSlug } = React.use(params)
  const persona = personaSlug as Persona
  const pathname = usePathname()
  const router = useRouter()

  const modules = React.useMemo(() => getModulesForPersona(persona), [persona])
  const completedSteps = useDemoStore((s) => s.completedSteps)

  const currentStepId = pathname.split("/").pop() ?? ""
  const currentIndex = modules.findIndex((m) => m.id === currentStepId)
  const completionPct = modules.length > 0 ? Math.round((completedSteps.size / modules.length) * 100) : 0

  function goBack() {
    if (currentIndex > 0) {
      router.push(`/demo-console/v3/${persona}/${modules[currentIndex - 1].id}`)
    }
  }

  function goNext() {
    if (currentIndex < modules.length - 1) {
      useDemoStore.getState().completeStep(currentIndex)
      // Auto-advance vehicle stage based on which module was just completed
      const completedModuleId = modules[currentIndex].id
      const nextStage = MODULE_STAGE_MAP[completedModuleId]
      if (nextStage) {
        useDemoStore.getState().advanceVehicleStage(nextStage)
      }
      router.push(`/demo-console/v3/${persona}/${modules[currentIndex + 1].id}`)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <header className="h-12 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#6C47FF]" />
          <Link href="/" className="font-bold text-sm">
            spyne
          </Link>
          <span className="text-[9px] font-mono bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">3.0</span>
        </div>

        <span className="text-sm font-medium text-gray-600">
          QuickShift Autos — Live Demo
        </span>

        <div className="flex items-center gap-3">
          <HoldingCostTicker />
          <button
            onClick={() => {
              useDemoStore.getState().reset()
              router.push("/demo-console/v3")
            }}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full px-2.5 py-1 transition-colors"
          >
            <RotateCw className="w-3 h-3" />
            Restart
          </button>
          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs rounded-full px-2 py-0.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Demo Mode
          </div>
          <span className="bg-purple-100 text-purple-700 text-xs rounded-full px-2 py-0.5 font-medium">
            {PERSONA_LABELS[persona] ?? persona}
          </span>
        </div>
      </header>

      {/* Vehicle journey timeline */}
      <VehicleJourney />

      {/* Context banner */}
      <ContextBanner moduleId={currentStepId} />

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar — 220px */}
        <aside className="w-56 bg-white border-r sticky top-12 h-[calc(100vh-48px-44px-38px)] overflow-y-auto shrink-0 flex flex-col">
          {/* Completion header */}
          <div className="px-4 pt-3 pb-3 border-b border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Progress</span>
              <span className="text-xs font-bold text-purple-600">{completionPct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-gray-400">
              Step {currentIndex + 1} of {modules.length}
            </p>
          </div>

          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 pt-3 pb-2">
            Modules
          </div>

          <nav className="flex flex-col gap-0.5 flex-1 pb-4">
            {modules.map((mod, idx) => {
              const isActive = currentStepId === mod.id
              const isCompleted = completedSteps.has(idx)
              const Icon = iconMap[mod.icon] ?? Upload

              return (
                <Link
                  key={mod.id}
                  href={`/demo-console/v3/${persona}/${mod.id}`}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg mx-2 transition-all duration-200",
                    isActive && "bg-purple-50 text-purple-700 border-l-2 border-purple-600 pl-2 shadow-sm",
                    isCompleted && !isActive && "text-green-700",
                    !isActive && !isCompleted && "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0",
                      isActive && "bg-purple-600 text-white",
                      isCompleted && !isActive && "bg-green-100 text-green-700",
                      !isActive && !isCompleted && "bg-gray-100 text-gray-500"
                    )}
                  >
                    {isCompleted && !isActive ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate text-[13px]">{mod.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom bar — 44px */}
      <footer className="h-11 bg-white border-t sticky bottom-0 z-20 flex items-center justify-between px-6 shrink-0">
        <button
          onClick={goBack}
          disabled={currentIndex <= 0}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Back
        </button>

        <div className="flex items-center gap-1.5">
          {modules.map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                idx === currentIndex && "bg-purple-600 scale-125",
                completedSteps.has(idx) && idx !== currentIndex && "bg-green-500",
                !completedSteps.has(idx) && idx !== currentIndex && "bg-gray-200"
              )}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={currentIndex >= modules.length - 1}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm px-5 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5"
        >
          {currentIndex === modules.length - 2 ? "See Impact →" : "Complete & Continue →"}
        </button>
      </footer>
    </div>
  )
}
