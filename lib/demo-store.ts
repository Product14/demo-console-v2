import { create } from "zustand"

// ─── Vehicle Data (hardcoded demo vehicle) ───

export const DEMO_VEHICLE = {
  vin: "1HGBH41JXMN109186",
  make: "Skoda",
  model: "Kamiq",
  year: 2024,
  color: "Quartz Grey",
  price: 22995,
  daysNotLive: 4,
  holdingCostPerDay: 46,
  totalHoldingLoss: 184,
  marketRank: 12,
  vdpViews: 0,
  matchConfidence: 98.7,
} as const

// ─── Module definitions ───

export type Persona = "fast" | "convert" | "full"

export interface DemoModule {
  id: string
  label: string
  icon: string
}

export const ALL_MODULES: DemoModule[] = [
  { id: "upload", label: "Vehicle Upload", icon: "upload" },
  { id: "smart-match", label: "Smart Match", icon: "zap" },
  { id: "ai-enhancements", label: "AI Enhancements", icon: "wand-2" },
  { id: "360-video", label: "360° & Video", icon: "rotate-ccw" },
  { id: "smart-campaign", label: "Smart Campaign", icon: "megaphone" },
  { id: "media-kit", label: "Media Kit", icon: "palette" },
  { id: "publishing", label: "Publishing", icon: "send" },
  { id: "smartview", label: "SmartView", icon: "monitor" },
  { id: "shooting-guide", label: "Shooting Guide", icon: "camera" },
  { id: "backgrounds", label: "Backgrounds", icon: "image" },
  { id: "3d-view", label: "3D View", icon: "box" },
  { id: "impact", label: "Impact Dashboard", icon: "trophy" },
]

export const PERSONA_MODULES: Record<Persona, string[]> = {
  fast: ["upload", "smart-match", "ai-enhancements", "publishing", "impact"],
  convert: ["upload", "ai-enhancements", "360-video", "smart-campaign", "smartview", "impact"],
  full: [
    "upload", "smart-match", "ai-enhancements", "360-video", "smart-campaign",
    "media-kit", "publishing", "smartview", "shooting-guide", "backgrounds", "3d-view", "impact",
  ],
}

export const PERSONA_LABELS: Record<Persona, string> = {
  fast: "Go-Live Fast Track",
  convert: "Conversion Booster",
  full: "Full Product Tour",
}

export function getModulesForPersona(persona: Persona): DemoModule[] {
  const ids = PERSONA_MODULES[persona]
  return ids.map((id) => ALL_MODULES.find((m) => m.id === id)!).filter(Boolean)
}

// ─── Store ───

interface DemoState {
  persona: Persona | null
  currentStep: number
  completedSteps: Set<number>
  demoStartTime: number | null
  holdingCostStopped: boolean
  transformationsApplied: string[]

  setPersona: (p: Persona) => void
  setCurrentStep: (step: number) => void
  completeStep: (step: number) => void
  startDemo: () => void
  stopHoldingCost: () => void
  addTransformation: (t: string) => void
  reset: () => void
}

export const useDemoStore = create<DemoState>((set) => ({
  persona: null,
  currentStep: 0,
  completedSteps: new Set(),
  demoStartTime: null,
  holdingCostStopped: false,
  transformationsApplied: [],

  setPersona: (p) => set({ persona: p }),
  setCurrentStep: (step) => set({ currentStep: step }),
  completeStep: (step) =>
    set((s) => ({
      completedSteps: new Set(s.completedSteps).add(step),
    })),
  startDemo: () => set({ demoStartTime: Date.now() }),
  stopHoldingCost: () => set({ holdingCostStopped: true }),
  addTransformation: (t) =>
    set((s) => ({
      transformationsApplied: [...s.transformationsApplied, t],
    })),
  reset: () =>
    set({
      persona: null,
      currentStep: 0,
      completedSteps: new Set(),
      demoStartTime: null,
      holdingCostStopped: false,
      transformationsApplied: [],
    }),
}))
