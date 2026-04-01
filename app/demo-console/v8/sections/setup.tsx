"use client"

import { motion } from "framer-motion"
import {
  BookOpen,
  Calendar,
  ChevronRight,
  ClipboardList,
  FileText,
  Presentation,
  Sparkles,
  RotateCcw,
  ExternalLink,
  Play,
} from "lucide-react"
import type { FormData } from "../page"
import type { AeDemoKit, AePreviousDemoType, AeResource } from "../ae-demo-kit"

const PHOTO_WORKFLOWS = ["in-house", "agency", "mixed", "unknown"]

const RESOURCE_ICONS: Record<AeResource["kind"], typeof BookOpen> = {
  "case-study": BookOpen,
  recording: Play,
  deck: Presentation,
  "one-pager": FileText,
  calendar: Calendar,
  crm: ClipboardList,
  custom: ExternalLink,
}

const DEMO_TYPE_LABEL: Record<AePreviousDemoType, string> = {
  discovery: "Discovery",
  "deep-dive": "Deep dive",
  "follow-up": "Follow-up",
  executive: "Executive",
}

const DEMO_TYPE_STYLES: Record<AePreviousDemoType, string> = {
  discovery: "bg-slate-100 text-slate-700 ring-slate-200/80",
  "deep-dive": "bg-violet-100 text-violet-800 ring-violet-200/80",
  "follow-up": "bg-emerald-100 text-emerald-800 ring-emerald-200/80",
  executive: "bg-amber-100 text-amber-900 ring-amber-200/80",
}

function initials(name: string) {
  const parts = name.replace(/\s+/g, " ").trim().split(" ")
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatSavedAt(ts: number) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(ts))
  } catch {
    return "recently"
  }
}

export function SetupSection({
  formData,
  setFormData,
  onStart,
  aeKit,
  resumeAvailable,
  resumeSavedAt,
  onResumeDemo,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  onStart: () => void
  aeKit: AeDemoKit
  resumeAvailable: boolean
  resumeSavedAt: number | null
  onResumeDemo: () => void
}) {
  function update(key: keyof FormData, v: string) {
    setFormData((p) => ({ ...p, [key]: v }))
  }

  const monthlyCars = Number(formData.monthlyCars) || 420
  const hcPerDay = Number(formData.holdingCostPerDay) || 45
  const fullPct = Number(formData.fullImageSetPct) || 58
  const invisibleCars = Math.round(monthlyCars * (1 - fullPct / 100))
  const dailyBurn = invisibleCars * hcPerDay

  return (
    <div className="flex items-center justify-center min-h-screen px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl w-full"
      >
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:gap-12 lg:items-start">
          <div className="space-y-8 max-w-2xl mx-auto lg:mx-0 lg:max-w-none w-full">
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
            <div className="w-6 h-6 rounded bg-[#6C47FF]" />
            <span className="text-gray-900 font-bold text-xl">spyne</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Start your demo
          </h1>
          <p className="text-gray-500 mt-2">
            Tell us about the dealership to personalize the experience
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200/90 bg-gray-50/80 p-6 shadow-[0_2px_20px_-6px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.02]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5 text-sm md:col-span-2">
              <span className="text-gray-500">Dealer / Group name</span>
              <input
                value={formData.dealerName}
                onChange={(e) => update("dealerName", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-300"
              />
            </label>
            <label className="space-y-1.5 text-sm md:col-span-2">
              <span className="text-gray-500">Dealership URL</span>
              <input
                value={formData.dealerUrl}
                onChange={(e) => update("dealerUrl", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-300"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-gray-500">Rooftop count</span>
              <input
                value={formData.rooftops}
                onChange={(e) => update("rooftops", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-gray-500">Monthly cars listed</span>
              <input
                value={formData.monthlyCars}
                onChange={(e) => update("monthlyCars", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-gray-500">Avg days on lot</span>
              <input
                value={formData.avgDaysOnLot}
                onChange={(e) => update("avgDaysOnLot", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-gray-500">Holding cost / day ($)</span>
              <input
                value={formData.holdingCostPerDay}
                onChange={(e) => update("holdingCostPerDay", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-gray-500">% listings with full image set</span>
              <input
                value={formData.fullImageSetPct}
                onChange={(e) => update("fullImageSetPct", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-gray-500">Photo workflow</span>
              <select
                value={formData.photoWorkflow}
                onChange={(e) => update("photoWorkflow", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900"
              >
                {PHOTO_WORKFLOWS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {dailyBurn > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center"
          >
            <p className="text-sm text-red-800">
              Right now, approximately <strong>{invisibleCars} vehicles</strong> in
              your inventory lack proper media.
              That&apos;s <strong className="text-red-600">${dailyBurn.toLocaleString()}/day</strong> in
              holding cost on invisible inventory.
            </p>
          </motion.div>
        )}

        <button
          onClick={onStart}
          className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 py-4 text-lg font-semibold text-white shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="h-5 w-5" /> Start Demo
        </button>
          </div>

          <aside className="mt-12 lg:mt-0 w-full max-w-md mx-auto lg:max-w-none lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:pr-1 space-y-4">
            {resumeAvailable && (
              <button
                type="button"
                onClick={onResumeDemo}
                className="w-full rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-600 to-violet-700 p-4 text-left text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-violet-600 hover:shadow-violet-500/35"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                    <RotateCcw className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Resume demo</p>
                    <p className="text-xs text-violet-100 mt-0.5">
                      Pick up your last session
                      {resumeSavedAt != null && (
                        <> · {formatSavedAt(resumeSavedAt)}</>
                      )}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-violet-200" />
                </div>
              </button>
            )}

            <div className="rounded-3xl border border-gray-200/90 bg-white shadow-[0_2px_24px_-4px_rgba(15,23,42,0.08)] overflow-hidden ring-1 ring-black/[0.03]">
              <div className="relative border-b border-gray-100 bg-gradient-to-br from-gray-50/80 to-white px-5 py-5">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500"
                  aria-hidden
                />
                <div className="flex gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-sm font-bold text-white shadow-md shadow-violet-500/30"
                    aria-hidden
                  >
                    {initials(aeKit.displayName)}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-600">
                      Your workspace
                    </p>
                    <p className="text-lg font-semibold text-gray-900 leading-snug truncate">
                      {aeKit.displayName}
                    </p>
                    {aeKit.territory && (
                      <p className="text-xs text-gray-500 mt-1 leading-snug">{aeKit.territory}</p>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                  Bookmark{" "}
                  <code className="rounded-md bg-violet-50 px-1.5 py-0.5 font-mono text-[10px] text-violet-800 ring-1 ring-violet-100">
                    ?ae={aeKit.id}
                  </code>
                  {aeKit.id === "default" ? " · sample kits: jordan, alex" : ""}
                </p>
              </div>

              <div className="px-2 py-3">
                <div className="flex items-center justify-between px-3 pb-2 pt-1">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Previous demos
                  </h2>
                  <span className="text-[10px] font-medium tabular-nums text-gray-400">
                    {aeKit.previousDemos.length} recording{aeKit.previousDemos.length === 1 ? "" : "s"}
                  </span>
                </div>
                <ul className="space-y-1 max-h-[min(14rem,40vh)] overflow-y-auto overscroll-contain pr-1 -mr-1">
                  {aeKit.previousDemos.map((d) => (
                    <li key={d.id}>
                      <a
                        href={d.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-gray-50"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-violet-600 ring-1 ring-gray-200/80 transition group-hover:bg-violet-50 group-hover:ring-violet-200/80"
                          aria-hidden
                        >
                          <Play className="h-4 w-4 fill-current" strokeWidth={0} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900 leading-snug group-hover:text-violet-700 transition-colors">
                              {d.title}
                            </p>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gray-300 opacity-0 transition group-hover:opacity-100 group-hover:text-violet-400 mt-0.5" />
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{d.account}</p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                            <span className="text-[11px] text-gray-400 tabular-nums">
                              {d.recordedAt} · {d.duration}
                            </span>
                            {d.type && (
                              <span
                                className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${DEMO_TYPE_STYLES[d.type]}`}
                              >
                                {DEMO_TYPE_LABEL[d.type]}
                              </span>
                            )}
                          </div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-100 bg-gray-50/50 px-2 py-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 px-3 pb-2 pt-1">
                  Collateral
                </h2>
                <ul className="space-y-0.5">
                  {aeKit.resources.map((r) => {
                    const Icon = RESOURCE_ICONS[r.kind]
                    return (
                      <li key={r.id}>
                        <a
                          href={r.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-white hover:shadow-sm"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 ring-1 ring-gray-200/90 shadow-sm">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1 pt-0.5">
                            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900 group-hover:text-violet-700">
                              {r.label}
                              <ExternalLink className="h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-violet-400 shrink-0" />
                            </span>
                            <span className="block text-xs text-gray-500 mt-0.5 leading-snug">
                              {r.description}
                            </span>
                          </span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  )
}
