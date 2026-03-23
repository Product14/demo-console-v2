"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type CampaignType = "seasonal" | "discount" | "event"
type ApplyScope = "this" | "suv" | "all"
type Tab = "campaign" | "media-kit"

export function ModuleSmartCampaign() {
  const [activeTab, setActiveTab] = useState<Tab>("campaign")
  const [campaignType, setCampaignType] = useState<CampaignType>("seasonal")
  const [applyScope, setApplyScope] = useState<ApplyScope>("all")
  const [bannerText, setBannerText] = useState("🎄 Christmas Sale — Save $2,000")

  const campaignTypes = [
    { id: "seasonal" as const, label: "Seasonal Offer" },
    { id: "discount" as const, label: "Discount Banner" },
    { id: "event" as const, label: "Event" },
  ]

  const applyScopes = [
    { id: "this" as const, label: "This car only" },
    { id: "suv" as const, label: "All SUVs" },
    { id: "all" as const, label: "Entire inventory" },
  ]

  const channels = ["Website", "AutoTrader", "Facebook Ads", "Instagram"]

  const mediaKitItems = [
    { label: "Dealership Hero Banner" },
    { label: "Logo Watermark" },
    { label: "Finance Offer Card", detail: "0% APR for 60 months" },
    { label: "Award Badge", detail: "Dealer of the Year" },
    { label: "QR Code" },
    { label: "Custom Tagline" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">Turn inventory into a marketing machine.</h1>
      </motion.div>

      {/* Tab pills */}
      <div className="inline-flex bg-gray-100 rounded-full p-1">
        {(["campaign", "media-kit"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {tab === "campaign" ? "Smart Campaign" : "Media Kit"}
          </button>
        ))}
      </div>

      {/* Tab 1 — Smart Campaign */}
      {activeTab === "campaign" && (
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Campaign type */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Campaign type</p>
            <div className="flex gap-2">
              {campaignTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setCampaignType(t.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                    campaignType === t.id
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign preview */}
          <div className="relative rounded-xl bg-gray-100 aspect-video overflow-hidden">
            {/* Car placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-32 bg-gray-300 rounded-lg" />
            </div>
            {/* Banner */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-500 text-white py-2 px-4">
              <input
                type="text"
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                className="bg-transparent w-full text-sm font-semibold outline-none placeholder-white/70"
              />
            </div>
            {/* Badge */}
            <Badge className="absolute top-3 right-3 bg-red-600 text-white text-xs">SEASONAL</Badge>
          </div>

          {/* Apply scope */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Apply to:</p>
            <div className="flex gap-2">
              {applyScopes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setApplyScope(s.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                    applyScope === s.id
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Channels</p>
            <div className="flex gap-2 flex-wrap">
              {channels.map((ch) => (
                <span
                  key={ch}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200"
                >
                  <Check className="h-3.5 w-3.5" />
                  {ch}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Deploy to 247 vehicles →
          </Button>
        </motion.div>
      )}

      {/* Tab 2 — Media Kit */}
      {activeTab === "media-kit" && (
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm font-medium text-gray-700">
            Your dealership branding — injected into every listing
          </p>

          {/* Grid of 6 cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaKitItems.map((item, i) => (
              <Card key={i}>
                <CardContent className="p-3 space-y-2">
                  <div className="aspect-video bg-gray-100 rounded-lg" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      {item.detail && (
                        <p className="text-xs text-gray-500">{item.detail}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                      Edit
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-sm text-green-600 font-medium">Applied to: 247 active listings</p>
        </motion.div>
      )}

      {/* Value callout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-900">
              <strong>Consistent branding across your entire inventory.</strong> Set once. Updated everywhere.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
