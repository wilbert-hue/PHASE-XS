"use client"

import type { ComparisonGroupPayload } from "@/lib/dashboard-query"
import type { DashboardRegion } from "@/lib/dashboard-region"
import { getRegionProfile, type ComparisonMetricKey } from "@/lib/dashboard-region-profile"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  type TooltipProps,
} from "recharts"
import { GitCompare, Users, Clock, FlaskConical, Activity, Target } from "lucide-react"

const PALETTE = ["#1B4965", "#2A8F9C", "#3AAFA9", "#4FBDBA", "#62B6CB", "#CAE9FF"]

const comparisonTooltipStyle = {
  backgroundColor: "hsl(var(--background))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 6,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  fontFamily: "var(--font-mono, monospace)",
  fontSize: 13,
  padding: "10px 12px",
}

function formatActualMetricValue(metricLabel: string, raw: number): string {
  if (!Number.isFinite(raw)) return "—"
  if (metricLabel.includes("Enrollment") || metricLabel === "Trials") {
    return raw.toLocaleString(undefined, { maximumFractionDigits: 0 })
  }
  if (metricLabel.includes("Adherence")) return `${raw.toFixed(1)}%`
  if (metricLabel.includes("Duration")) return `${raw.toFixed(1)} yr`
  if (metricLabel.includes("Arms")) return raw.toFixed(1)
  return raw.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function ComparisonTooltip({
  active,
  payload,
  label,
  actualByMetric,
}: TooltipProps<number, string> & {
  actualByMetric: Record<string, Record<string, number>>
}) {
  if (!active || !payload?.length) return null
  const metricLabel = String(label ?? "")
  const actuals = actualByMetric[metricLabel] ?? {}

  return (
    <div style={comparisonTooltipStyle}>
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "hsl(var(--muted-foreground))",
        }}
      >
        {metricLabel}
      </p>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {payload.map(entry => {
          const color = entry.color ?? PALETTE[0]
          const name = String(entry.name ?? "")
          const raw = actuals[name] ?? (typeof entry.value === "number" ? entry.value : 0)
          const value = formatActualMetricValue(metricLabel, raw)
          const pct =
            typeof entry.value === "number"
              ? `${entry.value.toFixed(0)}% of row max`
              : null

          return (
            <li
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 6,
                color: "hsl(var(--foreground))",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontWeight: 500 }}>{name}</span>
              <span style={{ color: "hsl(var(--muted-foreground))" }}>:</span>
              <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}</span>
              {pct && (
                <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginLeft: 4 }}>
                  ({pct})
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Scale each metric row to 0–100% so enrollment does not flatten trials/duration/arms. */
function buildScaledComparisonChart(
  metrics: ComparisonMetricKey[],
  summaries: { term: string; summary: ComparisonGroupPayload["summary"] }[],
) {
  const actualByMetric: Record<string, Record<string, number>> = {}
  const chartData = metrics.map(metric => {
    const metricLabel = METRIC_LABELS[metric]
    const actual: Record<string, number> = {}
    for (const s of summaries) {
      actual[s.term] = metricValue(metric, s.summary)
    }
    actualByMetric[metricLabel] = actual
    const max = Math.max(...Object.values(actual), 0)
    const row: Record<string, string | number> = { metric: metricLabel }
    for (const [term, value] of Object.entries(actual)) {
      row[term] = max > 0 ? (value / max) * 100 : 0
    }
    return row
  })
  return { chartData, actualByMetric }
}

const METRIC_LABELS: Record<ComparisonMetricKey, string> = {
  trials: "Trials",
  enrollment: "Total Enrollment",
  duration: "Avg Duration (y)",
  arms: "Avg Arms",
  adherence: "Avg Adherence (%)",
}

function metricValue(key: ComparisonMetricKey, summary: ComparisonGroupPayload["summary"]): number {
  switch (key) {
    case "trials":
      return summary.count
    case "enrollment":
      return summary.totalEnrollment
    case "duration":
      return Number(summary.avgDuration.toFixed(1))
    case "arms":
      return Number(summary.avgArms.toFixed(1))
    case "adherence":
      return Number(summary.avgAdherence.toFixed(1))
    default:
      return 0
  }
}

export function ComparisonPanel({
  region,
  groups,
}: {
  region: DashboardRegion
  groups: ComparisonGroupPayload[]
}) {
  if (groups.length < 2) return null

  const metrics = getRegionProfile(region).comparisonMetrics
  const summaries = groups.map(g => ({ term: g.term, summary: g.summary }))

  const { chartData, actualByMetric } = buildScaledComparisonChart(metrics, summaries)

  return (
    <div className="border border-border bg-background/60 backdrop-blur-sm">
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
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: accent }} />
                <span
                  className="font-mono text-[12px] uppercase tracking-widest truncate"
                  style={{ color: accent }}
                  title={s.term}
                >
                  {s.term}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                <Stat
                  icon={FlaskConical}
                  label="Trials"
                  value={s.summary.count.toLocaleString()}
                  color={accent}
                />
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
                {metrics.includes("adherence") && (
                  <Stat
                    icon={Target}
                    label="Adherence"
                    value={s.summary.avgAdherence ? `${s.summary.avgAdherence.toFixed(0)}%` : "—"}
                    color={accent}
                  />
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-border/40 space-y-1">
                <Row label="Top Phase" value={s.summary.topPhase} />
                <Row
                  label={region === "in" || region === "uk" ? "Top Condition" : "Top Indication"}
                  value={s.summary.topIndication}
                />
                <Row
                  label={
                    region === "in"
                      ? "Top Trial Type"
                      : region === "uk"
                        ? "Top Study Design"
                        : "Top Tech"
                  }
                  value={s.summary.topTech}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-border p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-accent" />
            <span className="font-mono text-[12px] uppercase tracking-widest text-muted-foreground">
              Metric Comparison
            </span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground/90">
            Each metric scaled 0–100% (100% = highest among compared terms) · hover for exact values
          </span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,127,127,0.15)" />
              <XAxis
                dataKey="metric"
                tick={{ fontSize: 11, fontFamily: "monospace", fill: "hsl(var(--foreground))" }}
                stroke="hsl(var(--border))"
                interval={0}
                angle={-12}
                textAnchor="end"
                height={56}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={v => `${v}%`}
                tick={{ fontSize: 11, fontFamily: "monospace", fill: "hsl(var(--foreground))" }}
                stroke="hsl(var(--border))"
                width={44}
              />
              <Tooltip
                content={
                  <ComparisonTooltip actualByMetric={actualByMetric} />
                }
                cursor={{ fill: "rgba(42,143,156,0.08)" }}
              />
              <Legend
                wrapperStyle={{ fontFamily: "monospace", fontSize: 12, paddingTop: 8 }}
                formatter={value => (
                  <span style={{ color: "hsl(var(--foreground))", marginLeft: 4 }}>{value}</span>
                )}
              />
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
