"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  getModulesForPersona,
  type Persona,
  type DemoModule,
} from "@/lib/demo-store"
import {
  ModuleUpload,
  ModuleSmartMatch,
  ModuleAIEnhancements,
  Module360Video,
  ModuleSmartCampaign,
  ModuleMediaKit,
  ModulePublishing,
  ModuleSmartView,
  ModuleShootingGuide,
  ModuleBackgrounds,
  Module3DView,
  ModuleImpact,
} from "@/components/demo-console"

const moduleComponents: Record<string, React.ComponentType> = {
  upload: ModuleUpload,
  "smart-match": ModuleSmartMatch,
  "ai-enhancements": ModuleAIEnhancements,
  "360-video": Module360Video,
  "smart-campaign": ModuleSmartCampaign,
  "media-kit": ModuleMediaKit,
  publishing: ModulePublishing,
  smartview: ModuleSmartView,
  "shooting-guide": ModuleShootingGuide,
  backgrounds: ModuleBackgrounds,
  "3d-view": Module3DView,
  impact: ModuleImpact,
}

// ─── Floating section nav ───

function SectionNav({
  modules,
  activeId,
  onNavigate,
}: {
  modules: DemoModule[]
  activeId: string
  onNavigate: (id: string) => void
}) {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1.5">
      {modules.map((mod, i) => (
        <button
          key={mod.id}
          onClick={() => onNavigate(mod.id)}
          title={mod.label}
          className={cn(
            "w-2.5 h-2.5 rounded-full transition-all duration-200",
            activeId === mod.id
              ? "bg-purple-600 scale-125"
              : "bg-gray-300 hover:bg-gray-400"
          )}
        />
      ))}
    </div>
  )
}

// ─── Main Studio 2.0 Component ───

export function Studio2({ persona }: { persona: Persona }) {
  const modules = React.useMemo(() => getModulesForPersona(persona), [persona])
  const [activeId, setActiveId] = React.useState(modules[0]?.id ?? "")
  const sectionRefs = React.useRef<Map<string, HTMLDivElement>>(new Map())

  // Track which section is visible
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    )

    sectionRefs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [modules])

  function handleNavigate(id: string) {
    const el = sectionRefs.current.get(id)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function setRef(id: string) {
    return (el: HTMLDivElement | null) => {
      if (el) sectionRefs.current.set(id, el)
      else sectionRefs.current.delete(id)
    }
  }

  return (
    <div className="relative">
      <SectionNav modules={modules} activeId={activeId} onNavigate={handleNavigate} />

      <div className="max-w-6xl mx-auto space-y-0">
        {modules.map((mod, idx) => {
          const Component = moduleComponents[mod.id]
          if (!Component) return null

          return (
            <motion.section
              key={mod.id}
              id={mod.id}
              ref={setRef(mod.id)}
              className="scroll-mt-16 py-12 border-b border-gray-200 last:border-b-0"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Section label */}
              <div className="flex items-center gap-3 mb-6">
                <span className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                  {mod.label}
                </span>
                <div className="flex-1 h-px bg-purple-100" />
              </div>

              {/* Module content */}
              <Component />
            </motion.section>
          )
        })}
      </div>
    </div>
  )
}
