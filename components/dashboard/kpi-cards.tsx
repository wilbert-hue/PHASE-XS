"use client"

import { useMemo } from "react"
import type { Trial } from "@/app/dashboard/trial-types"
import { normalizeMoleculeKey, parseDrugPriceNumber, moleculeFieldContainsInn } from "@/app/dashboard/trial-types"
import { Activity, Users, Clock, Beaker, Pill, DollarSign } from "lucide-react"

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

export function DashboardKPIs({
  trials,
  searchTerms = [],
}: {
  trials: Trial[]
  /** Single term + INN present in molecule cells: combo/regimen rows count as the searched drug once. */
  searchTerms?: string[]
}) {
  const stats = useMemo(() => {
    const totalEnrollment = trials.reduce((s, t) => s + (t.enrollment || 0), 0)
    const avgDuration = trials.length
      ? (trials.reduce((s, t) => s + (t.durationYears || 0), 0) / trials.length).toFixed(1)
      : "0"

    const singleTerm = searchTerms.length === 1 ? searchTerms[0].trim() : ""
    const innNorm = normalizeMoleculeKey(singleTerm)
    const innCollapse =
      innNorm.length >= 6 &&
      trials.some(t => moleculeFieldContainsInn(t.molecule, singleTerm))

    const moleculeKeys = trials.flatMap(t => {
      const mk = normalizeMoleculeKey(t.molecule)
      if (!mk) return []
      if (innCollapse && moleculeFieldContainsInn(t.molecule, singleTerm)) return [innNorm]
      return [mk]
    })
    const uniqueMolecules = new Set(moleculeKeys).size
    const moleculesSub = innCollapse ? "Searched INN in molecule (combos merged)" : "Unique compounds"

    const uniqueIndications = new Set(trials.map(t => t.indication).filter(Boolean)).size
    const avgAdherence = trials.filter(t => t.adherenceRate != null)
    const adherence = avgAdherence.length
      ? (avgAdherence.reduce((s, t) => s + t.adherenceRate!, 0) / avgAdherence.length).toFixed(1)
      : "N/A"
    const priceTrials = trials.map(t => parseDrugPriceNumber(t.drugPrice)).filter((n): n is number => n != null)
    const avgPrice = priceTrials.length
      ? (priceTrials.reduce((s, p) => s + p, 0) / priceTrials.length).toFixed(0)
      : "N/A"

    return { totalEnrollment, avgDuration, uniqueMolecules, uniqueIndications, adherence, avgPrice, moleculesSub }
  }, [trials, searchTerms])

  const accent = {
    trials: "#2563EB",
    enrollment: "#6D28D9",
    duration: "#B45309",
    molecules: "#0E7490",
    adherence: "#0D9488",
    price: "#047857",
  } as const

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <KPICard
        label="Total Trials"
        value={trials.length.toLocaleString()}
        sub="Filtered results"
        icon={Activity}
        accent={accent.trials}
      />
      <KPICard
        label="Total Enrollment"
        value={stats.totalEnrollment.toLocaleString()}
        sub="Participants across trials"
        icon={Users}
        accent={accent.enrollment}
      />
      <KPICard
        label="Avg Duration"
        value={`${stats.avgDuration} yr`}
        sub="Mean trial duration"
        icon={Clock}
        accent={accent.duration}
      />
      <KPICard
        label="Molecules"
        value={stats.uniqueMolecules.toLocaleString()}
        sub={stats.moleculesSub}
        icon={Beaker}
        accent={accent.molecules}
      />
      <KPICard
        label="Avg Adherence"
        value={stats.adherence === "N/A" ? "N/A" : `${stats.adherence}%`}
        sub="Patient compliance"
        icon={Pill}
        accent={accent.adherence}
      />
      <KPICard
        label="Avg Drug Price"
        value={stats.avgPrice === "N/A" ? "N/A" : `$${Number(stats.avgPrice).toLocaleString()}`}
        sub="Average per dose"
        icon={DollarSign}
        accent={accent.price}
      />
    </div>
  )
}
