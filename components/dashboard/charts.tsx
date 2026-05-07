"use client"

import { useMemo } from "react"
import type { Trial } from "@/app/dashboard/trial-types"
import { normalizePhase } from "@/app/dashboard/trial-types"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from "recharts"

const COLORS = [
  "#1B4965", "#1E6080", "#2A8F9C", "#3AAFA9", "#4FBDBA",
  "#266B80", "#34969E", "#48B5AD", "#1A5276", "#2E8B8B",
]

/** Stable key for grouping free-text dosage strengths (collapses casing / spacing variants). */
function dosageStrengthGroupingKey(raw: string): string | null {
  const s = raw.trim()
  if (!s || /^n\/?a$/i.test(s) || /^not\s*available$/i.test(s)) return null
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(\d+(?:\.\d+)?)\s*mg\/m2\b/gi, "$1 mg/m²")
    .replace(/(\d+(?:\.\d+)?)\s*mg\/kg\b/gi, "$1 mg/kg")
    .replace(/(\d+(?:\.\d+)?)\s*mg\b/gi, "$1 mg")
}

function formatDosageStrengthLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-background/60 backdrop-blur-sm p-5">
      <h3 className="font-mono text-[12px] uppercase tracking-widest text-muted-foreground mb-4">
        {title}
      </h3>
      {children}
    </div>
  )
}

const customTooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.95)",
  border: "1px solid #e0e0e0",
  borderRadius: 0,
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "13px",
  padding: "8px 12px",
}

export function DashboardCharts({ trials }: { trials: Trial[] }) {
  const phaseData = useMemo(() => {
    const map = new Map<string, number>()
    trials.forEach(t => {
      const p = normalizePhase(t.phase)
      map.set(p, (map.get(p) || 0) + 1)
    })
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [trials])

  const techData = useMemo(() => {
    const map = new Map<string, number>()
    trials.forEach(t => {
      if (t.technology) map.set(t.technology, (map.get(t.technology) || 0) + 1)
    })
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name: name.length > 25 ? name.slice(0, 22) + "..." : name, value, fullName: name }))
  }, [trials])

  const doseFocusData = useMemo(() => {
    const map = new Map<string, number>()
    trials.forEach(t => {
      const key = dosageStrengthGroupingKey(t.dosageStrength || "")
      if (!key) return
      map.set(key, (map.get(key) || 0) + 1)
    })
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, value]) => {
        const full = formatDosageStrengthLabel(key)
        return {
          fullName: full,
          name: full.length > 28 ? `${full.slice(0, 25)}…` : full,
          value,
        }
      })
  }, [trials])

  const timelineData = useMemo(() => {
    const map = new Map<string, number>()
    trials.forEach(t => {
      if (t.startDate) {
        const year = t.startDate.slice(0, 4)
        if (year && !isNaN(Number(year))) {
          map.set(year, (map.get(year) || 0) + 1)
        }
      }
    })
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([year, count]) => ({ year, count }))
  }, [trials])

  const topIndications = useMemo(() => {
    const map = new Map<string, number>()
    trials.forEach(t => {
      if (t.indication) map.set(t.indication, (map.get(t.indication) || 0) + 1)
    })
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({
        name: name.length > 30 ? name.slice(0, 27) + "..." : name.charAt(0) + name.slice(1).toLowerCase(),
        value,
        fullName: name,
      }))
  }, [trials])

  const routeData = useMemo(() => {
    const map = new Map<string, number>()
    trials.forEach(t => {
      if (t.routeOfAdmin) {
        const primary = t.routeOfAdmin.split(",")[0].trim()
        if (primary) map.set(primary, (map.get(primary) || 0) + 1)
      }
    })
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }))
  }, [trials])

  if (trials.length === 0) {
    return (
      <div className="border border-border p-12 text-center">
        <p className="font-mono text-base text-muted-foreground">No trials match the current filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Phase Distribution */}
      <ChartCard title="Trials by Phase">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={phaseData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {phaseData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend
                wrapperStyle={{ fontFamily: "var(--font-mono, monospace)", fontSize: "12px" }}
                iconSize={10}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Technology Breakdown */}
      <ChartCard title="Top Technologies">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={techData} layout="vertical" margin={{ left: 10, right: 16, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fontFamily: "var(--font-mono, monospace)" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={132}
                tick={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)" }}
              />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="value" fill="#1B4965" barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Dose focus — trials by grouped dosage strength */}
      <ChartCard title="Dose focus">
        <div className="h-[270px] min-h-[270px] flex items-center justify-center">
          {doseFocusData.length === 0 ? (
            <p className="font-mono text-sm text-muted-foreground px-6 text-center">
              No dosage strength values in the current filter set (excludes N/A and “Not Available”).
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={doseFocusData}
                layout="vertical"
                margin={{ left: 4, right: 16, top: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fontFamily: "var(--font-mono, monospace)" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={148}
                  tick={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)" }}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(v: number) => [`${v.toLocaleString()}`, "Trials"]}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as { fullName?: string }
                    return row?.fullName ?? ""
                  }}
                />
                <Bar dataKey="value" fill="#2A8F9C" barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>

      {/* Timeline */}
      <ChartCard title="Trials Started Over Time">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)" }} />
              <YAxis tick={{ fontSize: 12, fontFamily: "var(--font-mono, monospace)" }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#1E6080"
                fill="#1E6080"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Top Indications */}
      <ChartCard title="Top Indications">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topIndications} layout="vertical" margin={{ left: 10, right: 16, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fontFamily: "var(--font-mono, monospace)" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={154}
                tick={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)" }}
              />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="value" fill="#3AAFA9" barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Route of Administration */}
      <ChartCard title="Route of Administration">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={routeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {routeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend
                wrapperStyle={{ fontFamily: "var(--font-mono, monospace)", fontSize: "12px" }}
                iconSize={10}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  )
}
