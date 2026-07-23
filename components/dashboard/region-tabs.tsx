"use client"

import type { DashboardRegion } from "@/lib/dashboard-region"
import { cn } from "@/lib/utils"

export function DashboardRegionTabs({
  region,
  onChange,
  usCount,
  inCount,
  ukCount,
  esCount,
  beCount,
}: {
  region: DashboardRegion
  onChange: (r: DashboardRegion) => void
  usCount: number
  inCount: number
  ukCount: number
  esCount: number
  beCount: number
}) {
  const tabs: { id: DashboardRegion; label: string; count: number }[] = [
    { id: "us", label: "United States", count: usCount },
    { id: "in", label: "India", count: inCount },
    { id: "uk", label: "United Kingdom", count: ukCount },
    { id: "es", label: "Spain", count: esCount },
    { id: "be", label: "Belgium", count: beCount },
  ]

  return (
    <div
      className="flex flex-wrap items-center gap-2 p-1 rounded-lg border border-border/70 bg-background/60 backdrop-blur-sm"
      role="tablist"
      aria-label="Trial registry region"
    >
      {tabs.map(tab => {
        const active = region === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors rounded-md",
              active
                ? "bg-[#1B4965] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "tabular-nums px-1.5 py-0.5 rounded text-[10px]",
                active ? "bg-white/15" : "bg-muted/80",
              )}
            >
              {tab.count.toLocaleString()}
            </span>
          </button>
        )
      })}
    </div>
  )
}
