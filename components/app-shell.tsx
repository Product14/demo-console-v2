"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Bot, Globe, Layers, Play, Rocket, Sparkles, Wand2 } from "lucide-react"

interface AppShellProps {
  children: React.ReactNode
}

const tabs = [
  { href: "/demo-console", label: "Demo Console", icon: Play, match: (p: string) => p === "/demo-console" },
  { href: "/demo-console/v2", label: "2.0", icon: Globe, match: (p: string) => p.startsWith("/demo-console/v2") },
  { href: "/demo-console/v3", label: "3.0", icon: Sparkles, match: (p: string) => p.startsWith("/demo-console/v3") },
  { href: "/demo-console/v4", label: "4.0", icon: Wand2, match: (p: string) => p.startsWith("/demo-console/v4") },
  { href: "/demo-console/v5", label: "5.0", icon: Bot, match: (p: string) => p.startsWith("/demo-console/v5") },
  { href: "/demo-console/v7", label: "7.0", icon: Layers, match: (p: string) => p.startsWith("/demo-console/v7") },
  { href: "/demo-console/v8", label: "8.0", icon: Rocket, match: (p: string) => p.startsWith("/demo-console/v8") },
]

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <div className="w-full px-6">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[#6C47FF]" />
                <Link href="/" className="font-bold text-sm">
                  spyne
                </Link>
              </div>
              <nav className="flex items-center">
                {tabs.map((tab) => {
                  const isActive = tab.match(pathname)
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={cn(
                        "flex items-center gap-2 px-4 h-14 -mb-px text-sm font-medium border-b-2 transition-colors",
                        isActive
                          ? "text-foreground border-[#6C47FF]"
                          : "text-muted-foreground border-transparent hover:text-foreground"
                      )}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
