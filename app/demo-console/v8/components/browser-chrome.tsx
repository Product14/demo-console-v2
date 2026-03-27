"use client"

import { cn } from "@/lib/utils"

export function BrowserChrome({
  url,
  children,
  className,
}: {
  url: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden border border-gray-200 shadow-sm",
        className
      )}
    >
      <div className="border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 bg-gray-50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-lg px-3 py-1.5 text-sm text-gray-400 font-mono truncate border">
          {url}
        </div>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  )
}
