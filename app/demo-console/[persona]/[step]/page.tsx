"use client"

import * as React from "react"
import {
  ModuleUpload,
  ModuleSmartMatch,
  ModuleAIEnhancements,
  Module360Video,
  ModuleSmartCampaign,
  ModuleMediaKit,
  ModulePublishing,
  ModuleSmartView,
  ModuleShootingGuide,
  ModuleBackgrounds,
  Module3DView,
  ModuleImpact,
} from "@/components/demo-console"

const Placeholder = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center h-96 text-gray-400 text-lg">
    {name} — Coming Soon
  </div>
)

const stepComponents: Record<string, React.ComponentType> = {
  upload: ModuleUpload,
  "smart-match": ModuleSmartMatch,
  "ai-enhancements": ModuleAIEnhancements,
  "360-video": Module360Video,
  "smart-campaign": ModuleSmartCampaign,
  "media-kit": ModuleMediaKit,
  publishing: ModulePublishing,
  smartview: ModuleSmartView,
  "shooting-guide": ModuleShootingGuide,
  backgrounds: ModuleBackgrounds,
  "3d-view": Module3DView,
  impact: ModuleImpact,
}

export default function StepPage({
  params,
}: {
  params: Promise<{ persona: string; step: string }>
}) {
  const { step } = React.use(params)
  const Component = stepComponents[step]

  if (!Component) {
    return <Placeholder name={step} />
  }

  return <Component />
}
