"use client"

import type { Trial } from "@/app/dashboard/trial-types"
import { normalizePhase } from "@/app/dashboard/trial-types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts"
import { GitCompare, Users, Clock, FlaskConical, Activity, Target } from "lucide-react"

export interface ComparisonGroup {
  term: string
  trials: Trial[]
}

const PALETTE = ["#1B4965", "#2A8F9C", "#3AAFA9", "#4FBDBA", "#62B6CB", "#CAE9FF"]

function summarize(trials: Trial[]) {
  const count = trials.length
  if (count === 0) {
    return {
      count: 0,
      totalEnrollment: 0,
      avgDuration: 0,
      avgArms: 0,
      avgAdherence: 0,
      topPhase: "—",
      topIndication: "—",
      topTech: "—",
    }
  }
  const totalEnrollment = trials.reduce((s, t) => s + (t.enrollment || 0), 0)
  const durations = trials.filter(t => t.durationYears).map(t => t.durationYears)
  const arms = trials.filter(t => t.arms).map(t => t.arms)
  const adh = trials.filter(t => t.adherenceRate != null).map(t => t.adherenceRate as number)
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)

  const topOf = (key: keyof Trial) => {
    const m = new Map<string, number>()
    trials.forEach(t => {
      const v = String(t[key] || "").trim()
      if (v && v.toLowerCase() !== "not specified") m.set(v, (m.get(v) || 0) + 1)
    })
    const sorted = [...m.entries()].sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || "—"
  }

  return {
    count,
    totalEnrollment,
    avgDuration: avg(durations),
    avgArms: avg(arms),
    avgAdherence: avg(adh),
    topPhase: topOf("phase") !== "—" ? normalizePhase(topOf("phase")) : "—",
    topIndication: topOf("indication"),
    topTech: topOf("technology"),
  }
}

export function ComparisonPanel({ groups }: { groups: ComparisonGroup[] }) {
  if (groups.length < 2) return null

  const summaries = groups.map(g => ({ ...g, summary: summarize(g.trials) }))

  // Chart data: compare key numeric metrics across groups
  const chartData = [
    { metric: "Trials", ...Object.fromEntries(summaries.map(s => [s.term, s.summary.count])) },
    {
      metric: "Total Enrollment",
      ...Object.fromEntries(summaries.map(s => [s.term, s.summary.totalEnrollment])),
    },
    {
      metric: "Avg Duration (y)",
      ...Object.fromEntries(
        summaries.map(s => [s.term, Number(s.summary.avgDuration.toFixed(1))]),
      ),
    },
    {
      metric: "Avg Arms",
      ...Object.fromEntries(summaries.map(s => [s.term, Number(s.summary.avgArms.toFixed(1))])),
    },
    {
      metric: "Avg Adherence (%)",
      ...Object.fromEntries(
        summaries.map(s => [s.term, Number(s.summary.avgAdherence.toFixed(1))]),
      ),
    },
  ]

  return (
    <div className="border border-border bg-background/60 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <GitCompare className="h-3.5 w-3.5 text-accent" />
          <h3 className="font-mono text-[12px] uppercase tracking-widest text-muted-foreground">
            Comparison Mode
          </h3>
        </div>
        <span className="font-mono text-[12px] text-muted-foreground">
          {groups.length} terms · tip: separate terms with commas
        </span>
      </div>

      {/* Group cards */}
      <div
        className="grid gap-3 p-4"
        style={{ gridTemplateColumns: `repeat(${Math.min(summaries.length, 4)}, minmax(0, 1fr))` }}
      >
        {summaries.map((s, idx) => {
          const accent = PALETTE[idx % PALETTE.length]
          return (
            <div
              key={s.term}
              className="relative rounded-lg border border-border/60 p-4 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${accent}12 0%, transparent 80%)`,
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
              />
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: accent }}
                />
                <span
                  className="font-mono text-[12px] uppercase tracking-widest truncate"
                  style={{ color: accent }}
                  title={s.term}
                >
                  {s.term}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                <Stat icon={FlaskConical} label="Trials" value={s.summary.count.toLocaleString()} color={accent} />
                <Stat
                  icon={Users}
                  label="Enrollment"
                  value={
                    s.summary.totalEnrollment >= 1000
                      ? `${(s.summary.totalEnrollment / 1000).toFixed(1)}K`
                      : s.summary.totalEnrollment.toLocaleString()
                  }
                  color={accent}
                />
                <Stat
                  icon={Clock}
                  label="Avg Dur"
                  value={s.summary.avgDuration ? `${s.summary.avgDuration.toFixed(1)}y` : "—"}
                  color={accent}
                />
                <Stat
                  icon={Target}
                  label="Adherence"
                  value={s.summary.avgAdherence ? `${s.summary.avgAdherence.toFixed(0)}%` : "—"}
                  color={accent}
                />
              </div>
              <div className="mt-3 pt-3 border-t border-border/40 space-y-1">
                <Row label="Top Phase" value={s.summary.topPhase} />
                <Row label="Top Indication" value={s.summary.topIndication} />
                <Row label="Top Tech" value={s.summary.topTech} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-3 w-3 text-accent" />
          <span className="font-mono text-[12px] uppercase tracking-widest text-muted-foreground">
            Metric Comparison
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,127,127,0.15)" />
              <XAxis
                dataKey="metric"
                tick={{ fontSize: 12, fontFamily: "monospace" }}
                stroke="currentColor"
              />
              <YAxis tick={{ fontSize: 12, fontFamily: "monospace" }} stroke="currentColor" />
              <Tooltip
                contentStyle={{
                  background: "rgba(20,40,60,0.95)",
                  border: "1px solid rgba(42,143,156,0.4)",
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: "#fff",
                }}
              />
              <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 12 }} />
              {summaries.map((s, idx) => (
                <Bar
                  key={s.term}
                  dataKey={s.term}
                  fill={PALETTE[idx % PALETTE.length]}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: string
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
        <span style={{ color }}>
          <Icon className="h-2.5 w-2.5" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <div className="font-[var(--font-bebas)] text-xl tracking-wide leading-none" style={{ color }}>
        {value}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground flex-shrink-0">
        {label}
      </span>
      <span className="font-mono text-[12px] text-right text-foreground/80 truncate" title={value}>
        {value}
      </span>
    </div>
  )
}
