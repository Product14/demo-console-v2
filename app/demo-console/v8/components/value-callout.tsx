"use client"

import { motion } from "framer-motion"
import { Zap } from "lucide-react"

export function ValueCallout({
  children,
  delay = 0.4,
}: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3"
    >
      <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
      <div className="text-sm text-amber-900">{children}</div>
    </motion.div>
  )
}
