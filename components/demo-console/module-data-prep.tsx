"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Upload,
  Database,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Link,
  Settings,
  ArrowRight,
} from "lucide-react"

type SourceType = "dms" | "csv" | "api" | "manual"

const dataSources: { id: SourceType; label: string; desc: string; icon: typeof Database }[] = [
  { id: "dms", label: "DMS Integration", desc: "Connect your Dealer Management System", icon: Database },
  { id: "csv", label: "CSV / Excel Upload", desc: "Bulk import from spreadsheet", icon: FileSpreadsheet },
  { id: "api", label: "API Feed", desc: "Real-time sync via REST API", icon: Link },
  { id: "manual", label: "Manual Entry", desc: "Add vehicles one at a time", icon: Upload },
]

const fieldMappings = [
  { source: "stock_number", target: "VIN / Stock #", status: "mapped", confidence: 100 },
  { source: "vehicle_make", target: "Make", status: "mapped", confidence: 100 },
  { source: "vehicle_model", target: "Model", status: "mapped", confidence: 100 },
  { source: "model_year", target: "Year", status: "mapped", confidence: 100 },
  { source: "ext_color", target: "Exterior Color", status: "mapped", confidence: 98 },
  { source: "list_price", target: "Price", status: "mapped", confidence: 100 },
  { source: "veh_mileage", target: "Mileage", status: "mapped", confidence: 95 },
  { source: "body_style", target: "Body Type", status: "auto-mapped", confidence: 87 },
  { source: "dealer_notes", target: "Description", status: "auto-mapped", confidence: 82 },
  { source: "img_urls", target: "Existing Images", status: "review", confidence: 64 },
]

const validationResults = [
  { label: "Vehicles imported", value: "247", status: "success" },
  { label: "VINs validated", value: "244 / 247", status: "success" },
  { label: "Missing images", value: "12 vehicles", status: "warning" },
  { label: "Duplicate entries", value: "3 found", status: "warning" },
  { label: "Price anomalies", value: "1 flagged", status: "warning" },
  { label: "Ready to process", value: "231 vehicles", status: "success" },
]

export function ModuleDataPrep() {
  const [selectedSource, setSelectedSource] = useState<SourceType | null>(null)
  const [step, setStep] = useState<"source" | "mapping" | "validation">("source")
  const [mappingsRevealed, setMappingsRevealed] = useState(0)

  useEffect(() => {
    if (step !== "mapping") return
    setMappingsRevealed(0)
    const timers: NodeJS.Timeout[] = []
    fieldMappings.forEach((_, i) => {
      timers.push(setTimeout(() => setMappingsRevealed(i + 1), 300 + i * 150))
    })
    return () => timers.forEach(clearTimeout)
  }, [step])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">Connect your data. We handle the rest.</h1>
        <p className="text-gray-500 mt-1 text-sm">Import your inventory from any source — Spyne auto-maps fields and validates everything.</p>
      </motion.div>

      {/* Step indicator */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { key: "source", label: "1. Data Source" },
          { key: "mapping", label: "2. Field Mapping" },
          { key: "validation", label: "3. Validation" },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <ArrowRight className="w-4 h-4 text-gray-300" />}
            <button
              onClick={() => {
                if (s.key === "source") setStep("source")
                else if (s.key === "mapping" && selectedSource) setStep("mapping")
                else if (s.key === "validation" && selectedSource) setStep("validation")
              }}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                step === s.key
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-500"
              )}
            >
              {s.label}
            </button>
          </div>
        ))}
      </motion.div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === "source" && (
          <motion.div
            key="source"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataSources.map((source, i) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                >
                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedSource === source.id && "border-purple-500 ring-2 ring-purple-200"
                    )}
                    onClick={() => setSelectedSource(source.id)}
                  >
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className={cn(
                        "p-2.5 rounded-lg",
                        selectedSource === source.id ? "bg-purple-100" : "bg-gray-100"
                      )}>
                        <source.icon className={cn(
                          "h-5 w-5",
                          selectedSource === source.id ? "text-purple-600" : "text-gray-500"
                        )} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{source.label}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{source.desc}</p>
                      </div>
                      {selectedSource === source.id && (
                        <CheckCircle className="w-5 h-5 text-purple-600 ml-auto shrink-0" />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* DMS integrations */}
            {selectedSource === "dms" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden"
              >
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Supported DMS Providers
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["DealerSocket", "CDK Global", "Reynolds & Reynolds", "Frazer", "DealerCenter", "AutoManager", "Wayne Reaves", "PBS Systems"].map((dms) => (
                        <span key={dms} className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-lg">
                          {dms}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* CSV upload zone */}
            {selectedSource === "csv" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden"
              >
                <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center bg-purple-50/30">
                  <Upload className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-purple-700">Drop your CSV or Excel file here</p>
                  <p className="text-xs text-gray-500 mt-1">Supports .csv, .xlsx, .xls — up to 10,000 rows</p>
                </div>
              </motion.div>
            )}

            {selectedSource && (
              <div className="flex justify-end">
                <Button
                  onClick={() => setStep("mapping")}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Continue to Mapping →
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {step === "mapping" && (
          <motion.div
            key="mapping"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-purple-600" />
                    <p className="text-sm font-semibold text-gray-900">Auto Field Mapping</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 text-xs">AI-powered</Badge>
                </div>
                <div className="space-y-1">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-3 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    <span className="col-span-3">Source Field</span>
                    <span className="col-span-1 text-center">→</span>
                    <span className="col-span-3">Spyne Field</span>
                    <span className="col-span-2 text-center">Status</span>
                    <span className="col-span-3 text-right">Confidence</span>
                  </div>
                  {/* Rows */}
                  {fieldMappings.map((field, i) => {
                    const isRevealed = i < mappingsRevealed
                    return (
                      <motion.div
                        key={field.source}
                        className={cn(
                          "grid grid-cols-12 gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                          isRevealed ? "bg-white" : "bg-gray-50"
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isRevealed ? 1 : 0.3 }}
                      >
                        <span className="col-span-3 font-mono text-xs text-gray-600">{field.source}</span>
                        <span className="col-span-1 text-center text-gray-400">→</span>
                        <span className="col-span-3 text-gray-900 font-medium text-xs">{field.target}</span>
                        <span className="col-span-2 text-center">
                          {isRevealed && (
                            <Badge className={cn(
                              "text-[10px]",
                              field.status === "mapped" ? "bg-green-100 text-green-700" :
                              field.status === "auto-mapped" ? "bg-blue-100 text-blue-700" :
                              "bg-amber-100 text-amber-700"
                            )}>
                              {field.status === "mapped" ? "Exact" :
                               field.status === "auto-mapped" ? "Auto" : "Review"}
                            </Badge>
                          )}
                        </span>
                        <span className="col-span-3 text-right">
                          {isRevealed && (
                            <span className={cn(
                              "text-xs font-medium",
                              field.confidence >= 90 ? "text-green-600" :
                              field.confidence >= 80 ? "text-blue-600" :
                              "text-amber-600"
                            )}>
                              {field.confidence}%
                            </span>
                          )}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {mappingsRevealed >= fieldMappings.length && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <Button
                  onClick={() => setStep("validation")}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Run Validation →
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === "validation" && (
          <motion.div
            key="validation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {validationResults.map((result, i) => (
                <motion.div
                  key={result.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                >
                  <Card className={cn(
                    result.status === "warning" && "border-amber-200"
                  )}>
                    <CardContent className="p-4 flex items-start gap-3">
                      {result.status === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{result.label}</p>
                        <p className={cn(
                          "text-lg font-bold mt-0.5",
                          result.status === "success" ? "text-green-600" : "text-amber-600"
                        )}>
                          {result.value}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Summary card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-5 text-center space-y-3">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                  <p className="text-lg font-semibold text-green-900">Data Ready</p>
                  <p className="text-sm text-green-700">
                    231 vehicles validated and ready for AI processing. 16 items flagged for quick review.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Start Processing All Vehicles →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Value callout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-900">
              <strong>Manual data entry: 2–3 hours per 100 vehicles.</strong> Spyne auto-import: under 2 minutes for your entire inventory.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
