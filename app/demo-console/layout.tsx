"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { AppShell } from "@/components/app-shell"

export default function DemoConsoleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // When inside a persona flow (e.g. /demo-console/fast/upload),
  // don't wrap with AppShell — the persona layout provides its own chrome.
  const isPersonaFlow = /^\/demo-console\/(fast|convert|full|studio|v2|v3)/.test(pathname)

  if (isPersonaFlow) {
    return <>{children}</>
  }

  // Persona selection page — use AppShell for top nav
  return <AppShell>{children}</AppShell>
}
