"use client"

import { motion } from "framer-motion"
import { ImageIcon, Stamp, CreditCard, Award, QrCode, Type } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const assets = [
  { label: "Dealership Hero Banner", description: "Full-width banner for listings", icon: ImageIcon },
  { label: "Logo Watermark", description: "Subtle branding on every image", icon: Stamp },
  { label: "Finance Offer Card", description: "0% APR for 60 months", icon: CreditCard },
  { label: "Award Badge", description: "Dealer of the Year 2024", icon: Award },
  { label: "QR Code", description: "Direct link to VDP", icon: QrCode },
  { label: "Custom Tagline", description: "Your brand voice", icon: Type },
]

export function ModuleMediaKit() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">Your dealership identity — on every listing.</h1>
      </motion.div>

      {/* Asset grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset, i) => {
          const Icon = asset.icon
          return (
            <motion.div
              key={asset.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="rounded-xl">
                <CardContent className="p-4 space-y-3">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{asset.label}</p>
                      <p className="text-xs text-gray-500">{asset.description}</p>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Green stat bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-green-50 text-green-700 p-3 rounded-lg text-sm font-medium"
      >
        Applied to: 247 active listings
      </motion.div>

      {/* Value callout */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
