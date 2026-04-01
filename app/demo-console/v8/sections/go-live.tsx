"use client"

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  BarChart3, CalendarRange, Camera, Car, CheckCircle2, ChevronDown, DollarSign, Globe,
  Layers, MapPin, Megaphone,   MousePointerClick, Play, RotateCcw, Search, Send, Settings2,
  Share2, Shield, SlidersHorizontal, Sparkles, Target, Wallet, Zap,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BrowserChrome } from "../components/browser-chrome"
import { useImageLightbox, type GalleryItem } from "../components/image-lightbox"
import type { InventoryCar, FormData } from "../page"
import { PROC, PUBLISH_CHANNELS, CAMPAIGN_TYPES } from "../page"

const CAMPAIGN_DURATIONS = ["7 days", "14 days", "30 days", "Until paused"] as const
const CAMPAIGN_INTENTS = [
  "Drive leads",
  "Store visits",
  "Accelerate turns",
  "Brand awareness",
] as const
const BID_STRATEGIES = ["Balanced", "Maximize clicks", "Target cost / lead"] as const
const FREQUENCY_CAPS = ["1 / day", "3 / week", "No cap"] as const
const GEO_TARGETS = ["25 mi radius", "50 mi radius", "Full DMA", "Multi-rooftop"] as const
const AUDIENCES = [
  "In-market shoppers",
  "Site retargeting",
  "Lookalike buyers",
] as const
const CREATIVE_THEMES = [
  "Studio hero",
  "Price-forward",
  "CPO trust",
  "Seasonal event",
] as const
const PACING_OPTIONS = ["Even delivery", "Front-loaded (48h)"] as const
const ATTRIBUTION_WINDOWS = ["7-day click", "1-day click", "View-through assist"] as const
const DAILY_BUDGETS = ["$75", "$150", "$300", "$500", "$1,000"] as const
const LANDING_DESTINATIONS = ["VDP (vehicle detail)", "Filtered SRP", "Promo landing"] as const

const fieldClass =
  "w-full rounded-xl border border-gray-200/90 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-all focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/15"

function formatShortDate(iso: string) {
  if (!iso) return "—"
  const d = new Date(iso + "T12:00:00")
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function CampaignPanel({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]",
        className
      )}
    >
      <div className="flex items-start gap-3 border-b border-gray-100/90 bg-gradient-to-r from-slate-50/90 via-white to-purple-50/30 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/15 to-violet-500/10 text-purple-600 ring-1 ring-purple-500/10">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 pt-0.5">
          <h3 className="text-sm font-semibold tracking-tight text-gray-900">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function CampaignSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: ReactNode
}) {
  return (
    <label className="group block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(fieldClass, "cursor-pointer appearance-none pr-10")}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-purple-500" />
      </div>
    </label>
  )
}

function CampaignDateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      <div className="relative">
        <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(fieldClass, "pl-10")}
        />
      </div>
    </label>
  )
}

function CampaignToggle({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all",
        checked
          ? "border-purple-200/80 bg-purple-50/50 ring-1 ring-purple-500/15"
          : "border-gray-200/80 bg-gray-50/40 hover:border-gray-300"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors",
          checked ? "bg-purple-500" : "bg-gray-300"
        )}
      >
        <div
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked && "translate-x-5"
          )}
        />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>
    </button>
  )
}

const CHANNEL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  website: Globe, autotrader: Target, cargurus: BarChart3,
  carscom: Layers, facebook: Share2, google: Globe,
}

/** Literal paths — avoid RAW()/PROC() at module scope (circular import with page.tsx). */
const GO_LIVE_BEFORE_GALLERY: GalleryItem[] = [
  { src: "/demo-console/raw/raw-02.png", alt: "Before — listing 1" },
  { src: "/demo-console/raw/raw-03.png", alt: "Before — listing 2" },
  { src: "/demo-console/raw/raw-05.png", alt: "Before — listing 3" },
  { src: "/demo-console/raw/raw-07.png", alt: "Before — listing 4" },
]

const GO_LIVE_AFTER_GALLERY: GalleryItem[] = [
  { src: "/demo-console/processed/processed-01.png", alt: "After — studio 1" },
  { src: "/demo-console/processed/processed-09.png", alt: "After — studio 2" },
  { src: "/demo-console/processed/processed-03.png", alt: "After — studio 3" },
  { src: "/demo-console/processed/processed-04.png", alt: "After — studio 4" },
]

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
  const [campaignModalOpen, setCampaignModalOpen] = useState(false)
  const [campaignDuration, setCampaignDuration] =
    useState<(typeof CAMPAIGN_DURATIONS)[number]>("14 days")
  const [campaignIntent, setCampaignIntent] =
    useState<(typeof CAMPAIGN_INTENTS)[number]>("Drive leads")
  const [campaignStart, setCampaignStart] = useState("2026-03-28")
  const [campaignEnd, setCampaignEnd] = useState("2026-04-11")
  const [dailyBudget, setDailyBudget] =
    useState<(typeof DAILY_BUDGETS)[number]>("$300")
  const [bidStrategy, setBidStrategy] =
    useState<(typeof BID_STRATEGIES)[number]>("Balanced")
  const [frequencyCap, setFrequencyCap] =
    useState<(typeof FREQUENCY_CAPS)[number]>("3 / week")
  const [geoTarget, setGeoTarget] =
    useState<(typeof GEO_TARGETS)[number]>("50 mi radius")
  const [audience, setAudience] =
    useState<(typeof AUDIENCES)[number]>("In-market shoppers")
  const [creativeTheme, setCreativeTheme] =
    useState<(typeof CREATIVE_THEMES)[number]>("Studio hero")
  const [pacing, setPacing] =
    useState<(typeof PACING_OPTIONS)[number]>("Even delivery")
  const [attributionWindow, setAttributionWindow] =
    useState<(typeof ATTRIBUTION_WINDOWS)[number]>("7-day click")
  const [landingDest, setLandingDest] =
    useState<(typeof LANDING_DESTINATIONS)[number]>("VDP (vehicle detail)")
  const [oemCoopDisclaimers, setOemCoopDisclaimers] = useState(true)
  const [dayparting, setDayparting] = useState(true)
  const [includedVehicleIds, setIncludedVehicleIds] = useState<Set<string>>(new Set())
  const [vehicleSearch, setVehicleSearch] = useState("")
  const [campaignModalView, setCampaignModalView] = useState<"settings" | "vehicles">("settings")

  const { openImage, openGallery } = useImageLightbox()

  const carLabel = selectedCar ? `${selectedCar.year} ${selectedCar.make} ${selectedCar.model}` : formData.dealerName

  useEffect(() => {
    if (inventory.length === 0) return
    setIncludedVehicleIds((prev) => {
      if (prev.size === 0) return new Set(inventory.map((c) => c.id))
      const valid = new Set(inventory.map((c) => c.id))
      const next = new Set<string>()
      for (const id of prev) {
        if (valid.has(id)) next.add(id)
      }
      for (const id of valid) {
        if (!prev.has(id)) next.add(id)
      }
      return next
    })
  }, [inventory])

  const includedCount = includedVehicleIds.size
  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.trim().toLowerCase()
    if (!q) return inventory
    return inventory.filter((c) => {
      const blob = `${c.stockNo} ${c.year} ${c.make} ${c.model} ${c.trim} ${c.vin}`.toLowerCase()
      return blob.includes(q)
    })
  }, [inventory, vehicleSearch])

  const campaignSummaryLine = useMemo(() => {
    const parts = [
      campaignIntent,
      campaignDuration,
      dailyBudget,
      geoTarget,
    ]
    return parts.join(" · ")
  }, [campaignIntent, campaignDuration, dailyBudget, geoTarget])

  const flightLabel = useMemo(
    () => `${formatShortDate(campaignStart)} → ${formatShortDate(campaignEnd)}`,
    [campaignStart, campaignEnd]
  )

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
                {GO_LIVE_BEFORE_GALLERY.map((item, i) => (
                  <button
                    key={item.src}
                    type="button"
                    className="relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-lg border-0 bg-gray-100 p-0"
                    onClick={() => openGallery(GO_LIVE_BEFORE_GALLERY, i, "Website — before")}
                  >
                    <Image src={item.src} alt={item.alt} fill className="object-cover" />
                  </button>
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
                  {GO_LIVE_AFTER_GALLERY.map((item, i) => (
                    <button
                      key={item.src}
                      type="button"
                      className="relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-lg border-0 bg-gray-100 p-0"
                      onClick={() => openGallery(GO_LIVE_AFTER_GALLERY, i, "Website — after (studio)")}
                    >
                      <Image src={item.src} alt={item.alt} fill className="object-cover" />
                    </button>
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
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Smart Campaign</p>
            <p className="text-xs text-gray-500 mt-0.5">Sponsored placements synced to your studio assets</p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Draft · ready to publish
          </span>
        </div>

        <div className="group/card relative overflow-hidden rounded-2xl border border-purple-200/45 bg-gradient-to-br from-white via-purple-50/[0.35] to-violet-50/30 p-1 shadow-[0_20px_50px_-24px_rgba(109,40,217,0.35)]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-purple-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl" />

          <div className="relative space-y-5 rounded-[0.9rem] bg-white/80 p-5 ring-1 ring-purple-100/60 backdrop-blur-[2px] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-purple-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm shadow-purple-600/25">
                    {campaignType}
                  </span>
                  <span className="text-xs font-medium text-gray-400">·</span>
                  <span className="text-xs font-medium text-gray-600">{creativeTheme}</span>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">{campaignSummaryLine}</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { k: "Flight", v: flightLabel, icon: CalendarRange },
                      { k: "Daily cap", v: dailyBudget, icon: Wallet },
                      { k: "VINs", v: `${includedCount} / ${inventory.length}`, icon: Car },
                    ] as const
                  ).map(({ k, v, icon: Icon }) => (
                    <div
                      key={k}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200/90 bg-gray-50/80 px-3 py-2 text-left shadow-sm"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-purple-600 ring-1 ring-gray-100">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{k}</p>
                        <p className="text-xs font-semibold text-gray-900">{v}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCampaignModalView("settings")
                  setCampaignModalOpen(true)
                }}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-500 hover:to-violet-500 hover:shadow-purple-500/35 active:scale-[0.98]"
              >
                <Settings2 className="h-4 w-4" />
                Manage campaign
              </button>
            </div>

            <div className="flex flex-wrap gap-2 rounded-xl bg-gray-50/90 p-2 ring-1 ring-gray-100">
              {CAMPAIGN_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCampaignType(t)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                    campaignType === t
                      ? "bg-white text-purple-700 shadow-sm ring-1 ring-purple-200"
                      : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="group/preview relative aspect-[16/7] w-full cursor-zoom-in overflow-hidden rounded-xl border-0 bg-gray-900/5 p-0 text-left ring-1 ring-gray-200/80 transition-transform duration-300 hover:ring-purple-300/60 hover:shadow-lg hover:shadow-purple-500/10"
              onClick={() => openImage(PROC(9), `${campaignType} — ${carLabel}`)}
            >
              <Image
                src={PROC(9)}
                alt="Campaign"
                fill
                className="object-cover transition-transform duration-500 group-hover/preview:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-950/40 to-transparent" />
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white ring-1 ring-white/25 backdrop-blur-sm">
                  <Zap className="h-3 w-3" />
                  {campaignType}
                </span>
                <p className="mt-2 text-lg font-bold tracking-tight text-white drop-shadow-sm sm:text-xl">
                  {carLabel}
                  <span className="font-medium text-white/80"> — Spring Event</span>
                </p>
                <p className="mt-1 max-w-xl text-sm text-white/75">
                  {landingDest} · {geoTarget} ·{" "}
                  <span className="font-medium text-white">{includedCount}</span> VINs in rotation
                </p>
              </div>
            </button>
          </div>
        </div>

        <Dialog
          open={campaignModalOpen}
          onOpenChange={(open) => {
            setCampaignModalOpen(open)
            if (!open) setVehicleSearch("")
          }}
        >
          <DialogContent
            showCloseButton
            className="flex min-h-0 max-h-[min(92vh,880px)] w-[calc(100%-1.25rem)] max-w-5xl flex-col gap-0 overflow-hidden border-gray-200/80 p-0 shadow-2xl shadow-purple-950/15 sm:w-full sm:max-w-5xl [&_[data-slot=dialog-close]]:top-4 [&_[data-slot=dialog-close]]:text-white/80 [&_[data-slot=dialog-close]]:opacity-90 hover:[&_[data-slot=dialog-close]]:opacity-100 [&_[data-slot=dialog-close]]:ring-offset-purple-900"
          >
            <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 px-5 py-5 text-white sm:px-6 sm:py-6">
              <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-64 -translate-x-1/2 rounded-full bg-indigo-400/20 blur-3xl" />
              <DialogHeader className="relative space-y-0 text-left">
                <DialogTitle className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Campaign control center
                </DialogTitle>
                <DialogDescription className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
                  Shape who sees your ads, how budget flows, and which VINs get priority in the feed.
                </DialogDescription>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white ring-1 ring-white/20">
                    {campaignType}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/15">
                    {campaignIntent}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/15">
                    {dailyBudget}/day
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/15">
                    {includedCount} VINs
                  </span>
                </div>
              </DialogHeader>
            </div>

            <div className="flex gap-1 border-b border-gray-200 bg-slate-50/90 p-1.5 lg:hidden">
              {(
                [
                  { id: "settings" as const, label: "Strategy & targeting" },
                  { id: "vehicles" as const, label: `Vehicles (${includedCount})` },
                ]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCampaignModalView(tab.id)}
                  className={cn(
                    "flex-1 rounded-lg py-2.5 text-center text-xs font-semibold transition-all",
                    campaignModalView === tab.id
                      ? "bg-white text-purple-700 shadow-sm ring-1 ring-gray-200/80"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Below lg: tabs toggle panels. lg+: always two columns — grid + minmax(0) prevents overlap blowout. */}
            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_380px]">
              <div
                className={cn(
                  "min-h-0 min-w-0 overflow-y-auto overscroll-contain p-4 sm:p-5",
                  campaignModalView === "vehicles" && "max-lg:hidden"
                )}
              >
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
                  <CampaignPanel
                    icon={Megaphone}
                    title="Campaign story"
                    subtitle="Pick the merchandising angle buyers see in the hero unit."
                  >
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {CAMPAIGN_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setCampaignType(t)}
                          className={cn(
                            "rounded-xl border px-2 py-3 text-center text-[11px] font-semibold leading-snug transition-all sm:text-xs",
                            campaignType === t
                              ? "border-purple-400 bg-purple-50 text-purple-800 ring-2 ring-purple-500/20"
                              : "border-gray-200 bg-gray-50/50 text-gray-600 hover:border-purple-200 hover:bg-white"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </CampaignPanel>

                  <CampaignPanel
                    icon={CalendarRange}
                    title="Flight window"
                    subtitle="Duration presets keep pacing aligned with your lot strategy."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <CampaignSelect
                        label="Duration"
                        value={campaignDuration}
                        onChange={(v) =>
                          setCampaignDuration(v as (typeof CAMPAIGN_DURATIONS)[number])
                        }
                      >
                        {CAMPAIGN_DURATIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </CampaignSelect>
                      <CampaignSelect
                        label="Primary intent"
                        value={campaignIntent}
                        onChange={(v) =>
                          setCampaignIntent(v as (typeof CAMPAIGN_INTENTS)[number])
                        }
                      >
                        {CAMPAIGN_INTENTS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </CampaignSelect>
                      <CampaignDateField label="Start" value={campaignStart} onChange={setCampaignStart} />
                      <CampaignDateField label="End" value={campaignEnd} onChange={setCampaignEnd} />
                    </div>
                  </CampaignPanel>

                  <CampaignPanel
                    icon={Wallet}
                    title="Budget & delivery"
                    subtitle="Caps and pacing protect margin while bids chase your objective."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <CampaignSelect
                        label="Daily budget cap"
                        value={dailyBudget}
                        onChange={(v) => setDailyBudget(v as (typeof DAILY_BUDGETS)[number])}
                      >
                        {DAILY_BUDGETS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </CampaignSelect>
                      <CampaignSelect
                        label="Bid strategy"
                        value={bidStrategy}
                        onChange={(v) =>
                          setBidStrategy(v as (typeof BID_STRATEGIES)[number])
                        }
                      >
                        {BID_STRATEGIES.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </CampaignSelect>
                      <CampaignSelect
                        label="Frequency cap"
                        value={frequencyCap}
                        onChange={(v) =>
                          setFrequencyCap(v as (typeof FREQUENCY_CAPS)[number])
                        }
                      >
                        {FREQUENCY_CAPS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </CampaignSelect>
                      <CampaignSelect
                        label="Spend pacing"
                        value={pacing}
                        onChange={(v) =>
                          setPacing(v as (typeof PACING_OPTIONS)[number])
                        }
                      >
                        {PACING_OPTIONS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </CampaignSelect>
                      <CampaignSelect
                        label="Attribution"
                        value={attributionWindow}
                        onChange={(v) =>
                          setAttributionWindow(v as (typeof ATTRIBUTION_WINDOWS)[number])
                        }
                      >
                        {ATTRIBUTION_WINDOWS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </CampaignSelect>
                    </div>
                  </CampaignPanel>

                  <CampaignPanel
                    icon={MapPin}
                    title="Audience & geo"
                    subtitle="Tight radius for impulse buyers, DMA for branded campaigns."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <CampaignSelect
                        label="Geo focus"
                        value={geoTarget}
                        onChange={(v) =>
                          setGeoTarget(v as (typeof GEO_TARGETS)[number])
                        }
                      >
                        {GEO_TARGETS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </CampaignSelect>
                      <CampaignSelect
                        label="Audience signal"
                        value={audience}
                        onChange={(v) => setAudience(v as (typeof AUDIENCES)[number])}
                      >
                        {AUDIENCES.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </CampaignSelect>
                    </div>
                  </CampaignPanel>

                  <CampaignPanel
                    icon={Sparkles}
                    title="Creative & landing"
                    subtitle="Theme drives layout; destination controls the post-click path."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <CampaignSelect
                        label="Creative theme"
                        value={creativeTheme}
                        onChange={(v) =>
                          setCreativeTheme(v as (typeof CREATIVE_THEMES)[number])
                        }
                      >
                        {CREATIVE_THEMES.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </CampaignSelect>
                      <CampaignSelect
                        label="Click destination"
                        value={landingDest}
                        onChange={(v) =>
                          setLandingDest(v as (typeof LANDING_DESTINATIONS)[number])
                        }
                      >
                        {LANDING_DESTINATIONS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </CampaignSelect>
                    </div>
                  </CampaignPanel>

                  <CampaignPanel
                    icon={SlidersHorizontal}
                    title="Compliance & timing"
                    subtitle="Fine print for OEM programs and when ads are allowed to run."
                  >
                    <div className="grid gap-3 sm:grid-cols-1">
                      <CampaignToggle
                        checked={oemCoopDisclaimers}
                        onChange={setOemCoopDisclaimers}
                        title="OEM / co-op disclaimer blocks"
                        description="Auto-insert required legal lines when a vehicle qualifies for manufacturer funds."
                      />
                      <CampaignToggle
                        checked={dayparting}
                        onChange={setDayparting}
                        title="Dayparting (business hours bias)"
                        description="Weight delivery toward local shopping hours when your team can answer leads."
                      />
                    </div>
                  </CampaignPanel>
                </div>
              </div>

              <div
                className={cn(
                  "flex min-h-0 min-w-0 flex-col overflow-hidden border-t border-gray-200 bg-gradient-to-b from-slate-50/90 to-white max-lg:max-h-[min(52vh,420px)] max-lg:min-h-[240px] lg:border-l lg:border-t-0",
                  campaignModalView === "settings" && "max-lg:hidden"
                )}
              >
                <div className="shrink-0 border-b border-gray-200/80 bg-white/60 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/15 to-violet-500/10 text-purple-600 ring-1 ring-purple-500/15">
                      <Car className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">Vehicles in rotation</p>
                      <p className="text-xs text-gray-500">
                        {includedCount} selected · {filteredVehicles.length} shown
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setIncludedVehicleIds(new Set(inventory.map((c) => c.id)))
                      }
                      className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncludedVehicleIds(new Set())}
                      className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      None
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setIncludedVehicleIds(
                          new Set(inventory.filter((c) => isCarDone(c)).map((c) => c.id))
                        )
                      }
                      className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-[11px] font-semibold text-purple-800 shadow-sm hover:bg-purple-100"
                    >
                      Ready only
                    </button>
                  </div>
                  <div className="relative mt-3">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="search"
                      placeholder="Stock, VIN, make, model…"
                      value={vehicleSearch}
                      onChange={(e) => setVehicleSearch(e.target.value)}
                      className={cn(fieldClass, "pl-9")}
                    />
                  </div>
                </div>

                <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3">
                  {filteredVehicles.length === 0 ? (
                    <li className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 text-center">
                      <MousePointerClick className="mx-auto h-8 w-8 text-gray-300" />
                      <p className="mt-2 text-sm font-medium text-gray-600">No matches</p>
                      <p className="text-xs text-gray-500">Try another search term</p>
                    </li>
                  ) : (
                    filteredVehicles.map((car) => {
                      const on = includedVehicleIds.has(car.id)
                      const ready = isCarDone(car)
                      const thumb =
                        car.spynePhotos[0] ?? car.smartMatchPhotos[0] ?? car.lotPhotos[0] ?? PROC(1)
                      return (
                        <li key={car.id}>
                          <label
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-xl border p-2 transition-all",
                              on
                                ? "border-purple-200/90 bg-purple-50/70 shadow-sm shadow-purple-500/5 ring-1 ring-purple-500/10"
                                : "border-transparent bg-white hover:border-gray-200 hover:bg-gray-50/80"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => {
                                setIncludedVehicleIds((prev) => {
                                  const n = new Set(prev)
                                  n.has(car.id) ? n.delete(car.id) : n.add(car.id)
                                  return n
                                })
                              }}
                              className="size-4 shrink-0 rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                            />
                            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200/80">
                              <Image
                                src={thumb}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 leading-tight">
                                {car.year} {car.make} {car.model}
                              </p>
                              <p className="text-[11px] text-gray-500 truncate">
                                {car.trim} · {car.stockNo}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">{car.vin}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-xs font-bold text-gray-800">
                                ${car.price.toLocaleString()}
                              </p>
                              <span
                                className={cn(
                                  "mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                                  ready
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                )}
                              >
                                {ready ? "Ready" : "Queued"}
                              </span>
                            </div>
                          </label>
                        </li>
                      )
                    })
                  )}
                </ul>
              </div>
            </div>

            <DialogFooter className="border-t border-gray-200 bg-gradient-to-r from-slate-50/90 to-purple-50/30 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                Preview values are for this demo — nothing is sent to ad platforms.
              </p>
              <button
                type="button"
                onClick={() => setCampaignModalOpen(false)}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/25 transition-all hover:from-purple-500 hover:to-violet-500"
              >
                Save & close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Media Kit */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Media Kit</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {(
            [
              { label: "Hero Image", icon: Camera, proc: 1 },
              { label: "Watermarked", icon: Shield, proc: 2 },
              { label: "Finance Card", icon: DollarSign, proc: 3 },
              { label: "Badge Overlay", icon: Sparkles, proc: 5 },
              { label: "QR Code", icon: Globe, proc: 6 },
              { label: "Social Banner", icon: Share2, proc: 7 },
            ] as const
          ).map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  openImage(PROC(item.proc), `${item.label} — media kit export`)
                }
                className="cursor-zoom-in overflow-hidden rounded-xl border border-gray-200 bg-white p-0 text-left shadow-sm transition-all hover:border-purple-300 hover:shadow-md"
              >
                <div className="relative h-[4.5rem] w-full bg-gray-100">
                  <Image
                    src={PROC(item.proc)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 33vw, 160px"
                  />
                </div>
                <div className="flex items-center gap-2 p-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <Icon className="h-4 w-4 text-gray-500" />
                  </div>
                  <p className="text-xs font-medium leading-tight text-gray-800">{item.label}</p>
                </div>
              </button>
            )
          })}
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
