"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Zap, TrendingUp, Layers } from "lucide-react"
import { useDemoStore, type Persona } from "@/lib/demo-store"

const personas = [
  {
    id: "fast" as Persona,
    title: "I want to go live faster",
    subtitle: "Cars sitting = money bleeding",
    tag: "Used Car Manager / Ops",
    icon: Zap,
    iconBg: "bg-purple-600",
    href: "/demo-console/fast/upload",
  },
  {
    id: "convert" as Persona,
    title: "I want better conversions",
    subtitle: "Better visuals = more appointments",
    tag: "Marketing / Digital Manager",
    icon: TrendingUp,
    iconBg: "bg-green-600",
    href: "/demo-console/convert/upload",
  },
  {
    id: "full" as Persona,
    title: "I want to see everything",
    subtitle: "Full product walkthrough",
    tag: "AE Demo / Product Tour",
    icon: Layers,
    iconBg: "bg-blue-600",
    href: "/demo-console/full/upload",
  },
]

export default function DemoConsolePage() {
  const router = useRouter()

  function handleSelect(persona: Persona, href: string) {
    useDemoStore.getState().setPersona(persona)
    useDemoStore.getState().startDemo()
    router.push(href)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#0F0E1A" }}>
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-6 h-6 rounded bg-[#6C47FF]" />
        <span className="text-white font-bold text-2xl">spyne</span>
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-white text-[32px] font-bold mb-2">
          Experience the future of automotive merchandising
        </h1>
        <p className="text-gray-400 text-base">Choose what matters most to you</p>
      </motion.div>

      {/* Cards */}
      <div className="flex gap-6 max-w-4xl mx-auto mb-12">
        {personas.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.15 }}
            onClick={() => handleSelect(p.id, p.href)}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-8 cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]"
          >
            <div className={`w-12 h-12 ${p.iconBg} rounded-full flex items-center justify-center mb-5`}>
              <p.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">{p.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{p.subtitle}</p>
            <span className="inline-block text-xs text-gray-300 bg-white/10 rounded-full px-3 py-1">
              {p.tag}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-gray-500 text-sm">Powered by Studio AI</p>
    </div>
  )
}
