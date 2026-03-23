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
  type Persona,
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
} from "lucide-react"

// ─── Icon mapping ───

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
}

// ─── Holding Cost Ticker ───

function HoldingCostTicker() {
  const demoStartTime = useDemoStore((s) => s.demoStartTime)
  const holdingCostStopped = useDemoStore((s) => s.holdingCostStopped)
  const [cost, setCost] = React.useState(0)

  React.useEffect(() => {
    if (!demoStartTime || holdingCostStopped) return
    const interval = setInterval(() => {
      const elapsed = (Date.now() - demoStartTime) / 1000
      setCost(elapsed * 0.00053)
    }, 1000)
    return () => clearInterval(interval)
  }, [demoStartTime, holdingCostStopped])

  if (holdingCostStopped) {
    return (
      <div className="flex items-center gap-1 text-green-600 text-sm font-mono">
        <CheckCircle className="w-4 h-4" />
        <span>Stopped ✓</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end">
      <span className="text-red-600 font-mono text-sm">💸 ${cost.toFixed(2)}</span>
      <span className="text-[10px] text-gray-400 leading-none">holding cost since demo started</span>
    </div>
  )
}

// ─── Layout ───

export default function DemoPersonaLayout({
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

  // Determine current step index from pathname
  const currentStepId = pathname.split("/").pop() ?? ""
  const currentIndex = modules.findIndex((m) => m.id === currentStepId)

  function goBack() {
    if (currentIndex > 0) {
      router.push(`/demo-console/${persona}/${modules[currentIndex - 1].id}`)
    }
  }

  function goNext() {
    if (currentIndex < modules.length - 1) {
      useDemoStore.getState().completeStep(currentIndex)
      router.push(`/demo-console/${persona}/${modules[currentIndex + 1].id}`)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <header className="h-12 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-30 shrink-0">
        {/* Left */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#6C47FF]" />
          <span className="font-bold text-sm">spyne</span>
        </div>

        {/* Center */}
        <span className="text-sm font-medium text-gray-600">QuickShift Autos — Live Demo</span>

        {/* Right */}
        <div className="flex items-center gap-3">
          <HoldingCostTicker />
          <button
            onClick={() => {
              useDemoStore.getState().reset()
              router.push("/demo-console")
            }}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full px-2.5 py-1 transition-colors"
            title="Restart demo from persona selection"
          >
            <RotateCw className="w-3 h-3" />
            Restart
          </button>
          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs rounded-full px-2 py-0.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Demo Mode
          </div>
          <span className="bg-purple-100 text-purple-700 text-xs rounded-full px-2 py-0.5">
            {PERSONA_LABELS[persona] ?? persona}
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r sticky top-12 h-[calc(100vh-48px-44px)] overflow-y-auto shrink-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 pt-4 pb-2">
            Demo Modules
          </div>
          <nav className="flex flex-col gap-0.5">
            {modules.map((mod, idx) => {
              const isActive = currentStepId === mod.id
              const isCompleted = completedSteps.has(idx)
              const Icon = iconMap[mod.icon] ?? Upload

              return (
                <Link
                  key={mod.id}
                  href={`/demo-console/${persona}/${mod.id}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg mx-2 transition-colors",
                    isActive && "bg-purple-50 text-purple-700 border-l-2 border-purple-600 pl-2",
                    isCompleted && !isActive && "text-green-700",
                    !isActive && !isCompleted && "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {/* Step circle */}
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0",
                      isActive && "bg-purple-600 text-white",
                      isCompleted && !isActive && "bg-green-100 text-green-700",
                      !isActive && !isCompleted && "bg-gray-100 text-gray-500"
                    )}
                  >
                    {isCompleted && !isActive ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{mod.label}</span>
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

      {/* Bottom bar */}
      <footer className="h-11 bg-white border-t sticky bottom-0 z-20 flex items-center justify-between px-6 shrink-0">
        {/* Back */}
        <button
          onClick={goBack}
          disabled={currentIndex <= 0}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {modules.map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                idx === currentIndex && "bg-purple-600",
                completedSteps.has(idx) && idx !== currentIndex && "bg-green-500",
                !completedSteps.has(idx) && idx !== currentIndex && "bg-gray-200"
              )}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={goNext}
          disabled={currentIndex >= modules.length - 1}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
        >
          Next →
        </button>
      </footer>
    </div>
  )
}
