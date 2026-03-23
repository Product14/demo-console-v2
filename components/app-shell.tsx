"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Play } from "lucide-react"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-1 flex-col overflow-y-auto" data-slot="scroll-root">
        {/* Top Navigation Bar */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
          <div className="w-full px-6">
            <div className="flex h-14 items-center justify-between">
              {/* Left — Logo + Nav */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#6C47FF]" />
                  <span className="font-bold text-sm">spyne</span>
                </div>
                <nav className="flex items-center">
                  <Link
                    href="/demo-console"
                    className={cn(
                      "flex items-center gap-2 px-4 h-14 -mb-px text-sm font-medium border-b-2 transition-colors",
                      pathname.startsWith("/demo-console")
                        ? "text-foreground border-[#6C47FF]"
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    )}
                  >
                    <Play className="h-4 w-4" />
                    Demo Console
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
