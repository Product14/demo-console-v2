"use client"

import { motion } from "framer-motion"
import { Box, RotateCcw, ZoomIn, MapPin, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ValueCallout } from "./value-callout"

export function Module3DView() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">
          Give every buyer a showroom experience — from their phone.
        </h1>
      </motion.div>

      {/* 2-column layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left column */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Input row */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">38 images + 1 video</Badge>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <Badge className="bg-purple-600 text-white text-xs">3D Model</Badge>
          </div>

          {/* 3D Preview placeholder */}
          <div className="aspect-square rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/30 relative flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="relative inline-block">
                <Box className="h-14 w-14 text-purple-400" />
                <RotateCcw className="h-5 w-5 text-purple-300 absolute -top-1 -right-3 animate-spin" style={{ animationDuration: "4s" }} />
              </div>
              <p className="text-sm text-purple-500 font-medium">Interactive 3D Preview</p>
            </div>
            <Badge className="absolute top-3 right-3 bg-purple-600 text-white">3D</Badge>
          </div>

          {/* Control row */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Rotate
            </Button>
            <Button variant="outline" size="sm">
              <ZoomIn className="h-3.5 w-3.5 mr-1.5" />
              Zoom In
            </Button>
            <Button variant="outline" size="sm">
              <MapPin className="h-3.5 w-3.5 mr-1.5" />
              Add Hotspot
            </Button>
          </div>

          {/* Status text */}
          <p className="text-xs text-gray-500">Generated in 6 minutes from standard shoot</p>
        </motion.div>

        {/* Right column */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Output Channels */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Output Channels</h3>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🌐</span>
                  <span className="text-sm font-medium text-gray-900">Website embed</span>
                </div>
                <Button variant="outline" size="sm">Copy embed code</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📱</span>
                  <span className="text-sm font-medium text-gray-900">QR Code for forecourt</span>
                </div>
                <div className="w-24 h-24 bg-gray-100 rounded-lg grid grid-cols-5 grid-rows-5 gap-0.5 p-2">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        [0, 1, 2, 4, 5, 6, 10, 12, 14, 18, 20, 22, 23, 24].includes(i)
                          ? "bg-gray-800"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🕶️</span>
                  <span className="text-sm font-medium text-gray-900">AR Preview</span>
                </div>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium underline underline-offset-2">
                  Open on mobile
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>3D VDP viewers:</strong> 3.4x longer session
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Conversion:</strong> +52% vs image-only listing
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <ValueCallout>
        <strong>No 3D scanner. No special camera.</strong> Just the images you already took.
      </ValueCallout>
    </div>
  )
}
