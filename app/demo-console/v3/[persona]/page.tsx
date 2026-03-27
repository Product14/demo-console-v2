import { redirect } from "next/navigation"
import { PERSONA_MODULES, type Persona } from "@/lib/demo-store"

export default async function V3PersonaIndexPage({
  params,
}: {
  params: Promise<{ persona: string }>
}) {
  const { persona } = await params
  const modules = PERSONA_MODULES[persona as Persona]
  const firstStep = modules?.[0] ?? "upload"
  redirect(`/demo-console/v3/${persona}/${firstStep}`)
}
