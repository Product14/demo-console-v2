"use client"

import * as React from "react"
import {
  ModuleDataPrep,
  ModuleUpload,
  ModuleSmartMatch,
  ModuleAIEnhancements,
  Module360Video,
  ModuleSmartCampaign,
  ModuleMediaKit,
  ModulePublishing,
  ModulePlatformPreview,
  ModuleSmartView,
  ModuleAppComparison,
  ModuleScores,
  ModuleShootingGuide,
  ModuleBackgrounds,
  Module3DView,
  ModuleImpact,
} from "@/components/demo-console"

const stepComponents: Record<string, React.ComponentType> = {
  "data-prep": ModuleDataPrep,
  upload: ModuleUpload,
  "smart-match": ModuleSmartMatch,
  "ai-enhancements": ModuleAIEnhancements,
  "360-video": Module360Video,
  "smart-campaign": ModuleSmartCampaign,
  "media-kit": ModuleMediaKit,
  publishing: ModulePublishing,
  "platform-preview": ModulePlatformPreview,
  smartview: ModuleSmartView,
  "app-comparison": ModuleAppComparison,
  scores: ModuleScores,
  "shooting-guide": ModuleShootingGuide,
  backgrounds: ModuleBackgrounds,
  "3d-view": Module3DView,
  impact: ModuleImpact,
}

export default function V3StepPage({
  params,
}: {
  params: Promise<{ persona: string; step: string }>
}) {
  const { step } = React.use(params)
  const Component = stepComponents[step]

  if (!Component) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400 text-lg">
        {step} — Coming Soon
      </div>
    )
  }

  return <Component />
}
