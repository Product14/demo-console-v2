"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

const PIPELINE_NODES = [
  { id: "detect", label: "Car Detection" },
  { id: "bg-remove", label: "BG Removal" },
  { id: "bg-replace", label: "BG Replace" },
  { id: "shadow", label: "Shadow Gen" },
  { id: "exposure", label: "Exposure Fix" },
  { id: "plate", label: "Plate Mask" },
]

export function AIPipelineGraph({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4"
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        AI Pipeline
      </p>
      <div className="flex items-center gap-1 overflow-x-auto">
        {PIPELINE_NODES.map((node, i) => (
          <div key={node.id} className="flex items-center gap-1 shrink-0">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.1 + i * 0.12 }}
              className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1.5"
            >
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span className="text-xs font-medium text-green-700 whitespace-nowrap">
                {node.label}
              </span>
            </motion.div>
            {i < PIPELINE_NODES.length - 1 && (
              <div className="w-4 h-px bg-gray-300 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
