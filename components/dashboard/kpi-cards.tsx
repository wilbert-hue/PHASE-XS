"use client"

import type { KpiSnapshot } from "@/lib/dashboard-query"
import type { DashboardRegion } from "@/lib/dashboard-region"
import { getRegionProfile, type KpiCardKey } from "@/lib/dashboard-region-profile"
import { Activity, Users, Clock, Beaker, Pill, DollarSign, Target } from "lucide-react"

interface KPICardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}

function KPICard({ label, value, sub, icon: Icon, accent }: KPICardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg p-5 space-y-3 backdrop-blur-sm shadow-sm"
      style={{
        border: `1px solid ${accent}35`,
        background: `linear-gradient(150deg, ${accent}12 0%, ${accent}04 50%, var(--background) 100%)`,
        boxShadow: `inset 0 1px 0 ${accent}20`,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}99 55%, ${accent}40)` }}
      />
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <span
          className="font-mono text-[12px] uppercase tracking-widest pl-0.5 border-l-2"
          style={{ borderColor: `${accent}99`, color: "hsl(var(--muted-foreground))" }}
        >
          {label}
        </span>
        <div
          className="flex items-center justify-center w-9 h-9 rounded-md shrink-0 shadow-sm"
          style={{
            background: `linear-gradient(145deg, ${accent}2a, ${accent}12)`,
            color: accent,
            boxShadow: `0 0 0 1px ${accent}25 inset`,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div>
        <p className="font-[var(--font-bebas)] text-4xl tracking-wider" style={{ color: accent }}>
          {value}
        </p>
        {sub && (
          <p className="font-mono text-[12px] text-muted-foreground mt-1.5 pl-0.5">{sub}</p>
        )}
      </div>
    </div>
  )
}

const KPI_ACCENTS: Record<KpiCardKey, string> = {
  trials: "#2563EB",
  enrollment: "#6D28D9",
  duration: "#B45309",
  molecules: "#0E7490",
  indications: "#BE123C",
  adherence: "#0D9488",
  price: "#047857",
}

const KPI_ICONS: Record<KpiCardKey, React.ComponentType<{ className?: string }>> = {
  trials: Activity,
  enrollment: Users,
  duration: Clock,
  molecules: Beaker,
  indications: Target,
  adherence: Pill,
  price: DollarSign,
}

function kpiValue(key: KpiCardKey, filteredTrialCount: number, kpi: KpiSnapshot): string | number {
  switch (key) {
    case "trials":
      return filteredTrialCount.toLocaleString()
    case "enrollment":
      return kpi.totalEnrollment.toLocaleString()
    case "duration":
      return `${kpi.avgDuration} yr`
    case "molecules":
      return kpi.uniqueMolecules.toLocaleString()
    case "indications":
      return kpi.uniqueIndications.toLocaleString()
    case "adherence":
      return kpi.adherence === "N/A" ? "N/A" : `${kpi.adherence}%`
    case "price":
      return kpi.avgPrice === "N/A" ? "N/A" : `$${Number(kpi.avgPrice).toLocaleString()}`
    default:
      return "—"
  }
}

export function DashboardKPIs({
  region,
  filteredTrialCount,
  kpi,
}: {
  region: DashboardRegion
  filteredTrialCount: number
  kpi: KpiSnapshot
}) {
  const cards = getRegionProfile(region).kpiCards
  const colClass =
    cards.length <= 5
      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
      : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"

  return (
    <div className={colClass}>
      {cards.map(card => (
        <KPICard
          key={card.key}
          label={card.label}
          value={kpiValue(card.key, filteredTrialCount, kpi)}
          sub={card.key === "molecules" ? kpi.moleculesSub : card.sub}
          icon={KPI_ICONS[card.key]}
          accent={KPI_ACCENTS[card.key]}
        />
      ))}
    </div>
  )
}
