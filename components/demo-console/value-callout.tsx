"use client"

import { motion } from "framer-motion"
import { Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ValueCalloutProps {
  children: React.ReactNode
  delay?: number
}

export function ValueCallout({ children, delay = 0.4 }: ValueCalloutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 flex items-start gap-3">
          <Zap className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">{children}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
