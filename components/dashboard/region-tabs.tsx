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
  dkCount,
  frCount,
  deCount,
  itCount,
  luCount,
  nlCount,
  noCount,
  plCount,
  ruCount,
  sgCount,
  krCount,
  seCount,
}: {
  region: DashboardRegion
  onChange: (r: DashboardRegion) => void
  usCount: number
  inCount: number
  ukCount: number
  esCount: number
  beCount: number
  dkCount: number
  frCount: number
  deCount: number
  itCount: number
  luCount: number
  nlCount: number
  noCount: number
  plCount: number
  ruCount: number
  sgCount: number
  krCount: number
  seCount: number
}) {
  const tabs: { id: DashboardRegion; label: string; count: number }[] = [
    { id: "us", label: "United States", count: usCount },
    { id: "in", label: "India", count: inCount },
    { id: "uk", label: "United Kingdom", count: ukCount },
    { id: "es", label: "Spain", count: esCount },
    { id: "be", label: "Belgium", count: beCount },
    { id: "dk", label: "Denmark", count: dkCount },
    { id: "fr", label: "France", count: frCount },
    { id: "de", label: "Germany", count: deCount },
    { id: "it", label: "Italy", count: itCount },
    { id: "lu", label: "Luxembourg", count: luCount },
    { id: "nl", label: "Netherlands", count: nlCount },
    { id: "no", label: "Norway", count: noCount },
    { id: "pl", label: "Poland", count: plCount },
    { id: "ru", label: "Russia", count: ruCount },
    { id: "sg", label: "Singapore", count: sgCount },
    { id: "kr", label: "South Korea", count: krCount },
    { id: "se", label: "Sweden", count: seCount },
  ]

  return (
    <div
      className="w-full overflow-x-auto scrollbar-hide"
      role="tablist"
      aria-label="Trial registry region"
    >
      <div className="flex items-center gap-1 p-1 rounded-lg border border-border/70 bg-background/60 backdrop-blur-sm min-w-max">
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
                "inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors rounded-md whitespace-nowrap",
                active
                  ? "bg-[#1B4965] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "tabular-nums px-1 py-0.5 rounded text-[9px]",
                  active ? "bg-white/15" : "bg-muted/80",
                )}
              >
                {tab.count.toLocaleString()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
