"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const backgrounds = [
  { id: "white-studio", label: "Pure White Studio", gradient: "linear-gradient(135deg, #f8f8f8, #e8e8e8)" },
  { id: "outdoor-showroom", label: "Outdoor Showroom", gradient: "linear-gradient(135deg, #87CEEB, #228B22)" },
  { id: "sunset-highway", label: "Sunset Highway", gradient: "linear-gradient(135deg, #FF6B35, #F7C59F)" },
  { id: "city-skyline", label: "City Skyline Night", gradient: "linear-gradient(135deg, #0F0C29, #302B63)" },
  { id: "mountain-road", label: "Mountain Road", gradient: "linear-gradient(135deg, #4CA1AF, #C4E0E5)" },
  { id: "branded-forecourt", label: "Branded Forecourt", gradient: "linear-gradient(135deg, #6C47FF, #9B7FFF)", badge: "Your Brand" },
  { id: "minimal-concrete", label: "Minimal Concrete", gradient: "linear-gradient(135deg, #d3cce3, #e9e4f0)" },
  { id: "custom-upload", label: "Custom Upload", gradient: null },
]

export function ModuleBackgrounds() {
  const [selectedBg, setSelectedBg] = useState("white-studio")

  const selected = backgrounds.find((b) => b.id === selectedBg)!

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">Your inventory. Any mood. Any season.</h1>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Background grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {backgrounds.map((bg, i) => (
              <motion.div
                key={bg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <button
                  onClick={() => setSelectedBg(bg.id)}
                  className={cn(
                    "w-full text-left transition-all",
                    selectedBg === bg.id
                      ? "ring-2 ring-purple-600 ring-offset-2 rounded-xl"
                      : "hover:ring-2 hover:ring-gray-300 rounded-xl"
                  )}
                >
                  {bg.gradient ? (
                    <div
                      className="h-28 rounded-xl relative"
                      style={{ background: bg.gradient }}
                    >
                      {bg.badge && (
                        <Badge className="absolute top-2 right-2 bg-white/90 text-purple-700 text-[10px]">
                          {bg.badge}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-white">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <p className="text-xs font-medium text-center mt-1 text-gray-700">{bg.label}</p>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Preview card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-900">Current BG: {selected.label}</p>
                {selected.gradient && (
                  <div
                    className="w-5 h-5 rounded-full shrink-0 border border-gray-200"
                    style={{ background: selected.gradient }}
                  />
                )}
              </div>

              {/* Car placeholder with selected background */}
              <div
                className="aspect-video rounded-xl flex items-center justify-center"
                style={{ background: selected.gradient || "#f3f4f6" }}
              >
                <div className="w-32 h-20 bg-white/30 backdrop-blur-sm rounded-lg border border-white/40 flex items-center justify-center">
                  <span className="text-xs text-white/80 font-medium">Vehicle Preview</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom text + button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-gray-500">New backgrounds added monthly. Seasonal packs available.</p>
        <Button variant="outline">+ Request Custom Background</Button>
      </motion.div>
    </div>
  )
}
