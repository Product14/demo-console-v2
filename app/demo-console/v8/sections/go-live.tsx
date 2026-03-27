"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  BarChart3, Camera, CheckCircle2, DollarSign, Globe,
  Layers, Play, RotateCcw, Send, Share2, Shield, Sparkles, Target,
} from "lucide-react"
import { BrowserChrome } from "../components/browser-chrome"
import type { InventoryCar, FormData } from "../page"
import { RAW, PROC, PUBLISH_CHANNELS, CAMPAIGN_TYPES } from "../page"

const CHANNEL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  website: Globe, autotrader: Target, cargurus: BarChart3,
  carscom: Layers, facebook: Share2, google: Globe,
}

export function GoLiveSection({
  formData,
  inventory,
  selectedCar,
  isCarDone,
  onPublish,
}: {
  formData: FormData
  inventory: InventoryCar[]
  selectedCar: InventoryCar | null
  isCarDone: (car: InventoryCar) => boolean
  onPublish: () => void
}) {
  const [publishChannels, setPublishChannels] = useState<Set<string>>(new Set(["website"]))
  const [campaignType, setCampaignType] = useState("New Arrival")
  const [published, setPublished] = useState(false)

  const carLabel = selectedCar ? `${selectedCar.year} ${selectedCar.make} ${selectedCar.model}` : formData.dealerName

  function handlePublish() {
    setPublished(true)
    setTimeout(onPublish, 800)
  }

  return (
    <div className="space-y-10">
      {/* Website Before/After */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            This is what your website looks like now
          </h2>
          <p className="text-gray-500 mt-1">
            Side-by-side: your current listings vs. Spyne-processed listings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Before */}
          <BrowserChrome url={`${formData.dealerUrl}/inventory`}>
            <div className="p-3 space-y-2 max-h-[400px] overflow-hidden">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Before</p>
              <div className="grid grid-cols-2 gap-2">
                {[RAW(2), RAW(3), RAW(5), RAW(7)].map((src, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                    <Image src={src} alt={`Before ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-red-500 font-medium">Low quality</span>
                <span className="text-[10px] text-gray-300">·</span>
                <span className="text-[10px] text-red-500 font-medium">Inconsistent</span>
                <span className="text-[10px] text-gray-300">·</span>
                <span className="text-[10px] text-red-500 font-medium">Missing photos</span>
              </div>
            </div>
          </BrowserChrome>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          >
            <BrowserChrome url={`${formData.dealerUrl}/inventory`} className="ring-2 ring-purple-400/30">
              <div className="p-3 space-y-2 max-h-[400px] overflow-hidden">
                <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">After — Studio AI</p>
                <div className="grid grid-cols-2 gap-2">
                  {[PROC(1), PROC(9), PROC(3), PROC(4)].map((src, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                      <Image src={src} alt={`After ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] text-green-600 font-medium">Studio quality</span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] text-green-600 font-medium">Consistent</span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] text-green-600 font-medium">Complete coverage</span>
                </div>
              </div>
            </BrowserChrome>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 gap-4 max-w-md mx-auto"
        >
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">2.3x</p>
            <p className="text-xs text-gray-500 mt-1">More time on VDP</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">34%</p>
            <p className="text-xs text-gray-500 mt-1">Higher lead conversion</p>
          </div>
        </motion.div>
      </div>

      {/* 360 + Video */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Rich Media — Auto-Generated</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto">
              <RotateCcw className="h-8 w-8 text-purple-400 animate-[spin_4s_linear_infinite]" />
            </div>
            <p className="font-semibold text-gray-900">360° Spin View</p>
            <p className="text-sm text-gray-500">4 images → full interactive spin. Under 30 seconds.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto">
              <Play className="h-8 w-8 text-blue-400" />
            </div>
            <p className="font-semibold text-gray-900">Video Walkthrough</p>
            <p className="text-sm text-gray-500">Auto-generated 15-second branded video tour.</p>
          </div>
        </div>
      </div>

      {/* Publishing channels */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Publishing Destinations</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PUBLISH_CHANNELS.map((ch) => {
            const active = !ch.comingSoon && publishChannels.has(ch.id)
            const Icon = CHANNEL_ICONS[ch.id] || Globe
            return (
              <button
                key={ch.id}
                onClick={() => !ch.comingSoon && setPublishChannels((prev) => {
                  const n = new Set(prev)
                  n.has(ch.id) ? n.delete(ch.id) : n.add(ch.id)
                  return n
                })}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all relative",
                  ch.comingSoon ? "border-gray-200 bg-gray-50/50 opacity-60 cursor-not-allowed"
                    : active ? "border-purple-500/40 bg-purple-500/10 ring-1 ring-purple-500/30"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={cn("h-5 w-5", active ? "text-purple-500" : "text-gray-400")} />
                  {ch.comingSoon ? (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">Coming Soon</span>
                  ) : (
                    <div className={cn("w-9 h-5 rounded-full p-0.5 transition-colors", active ? "bg-purple-500" : "bg-gray-300")}>
                      <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", active && "translate-x-4")} />
                    </div>
                  )}
                </div>
                <p className={cn("text-sm font-semibold", active ? "text-purple-700" : "text-gray-700")}>{ch.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{ch.desc}</p>
                {published && active && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="absolute top-3 right-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </motion.div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Smart Campaign */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Smart Campaign</p>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {CAMPAIGN_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setCampaignType(t)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  campaignType === t ? "bg-purple-500 text-white border-purple-500" : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative rounded-xl overflow-hidden aspect-[16/7] bg-gray-200">
            <Image src={PROC(9)} alt="Campaign" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">{campaignType}</span>
              <p className="text-white text-lg font-bold mt-1">{carLabel} — Spring Event</p>
              <p className="text-white/70 text-sm">Studio-quality photos. Verified listing. Ready to sell.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Media Kit */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Media Kit</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Hero Image", icon: Camera },
            { label: "Watermarked", icon: Shield },
            { label: "Finance Card", icon: DollarSign },
            { label: "Badge Overlay", icon: Sparkles },
            { label: "QR Code", icon: Globe },
            { label: "Social Banner", icon: Share2 },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center mx-auto mb-2">
                <item.icon className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-xs font-medium text-gray-700">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Publish CTA */}
      {!published ? (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handlePublish}
          className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-4 text-lg font-bold text-white transition-all flex items-center justify-center gap-2"
        >
          <Send className="h-5 w-5" /> Publish {inventory.length} Vehicles
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-green-50 border border-green-200 py-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-lg">
            <CheckCircle2 className="h-5 w-5" /> Published — Holding cost stopped
          </div>
        </motion.div>
      )}
    </div>
  )
}
