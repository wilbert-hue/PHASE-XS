"use client"

import type { ChartSeriesPayload } from "@/lib/dashboard-query"
import type { DashboardRegion } from "@/lib/dashboard-region"
import { getRegionProfile, type ChartKey } from "@/lib/dashboard-region-profile"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts"

const COLORS = [
  "#1B4965",
  "#1E6080",
  "#2A8F9C",
  "#3AAFA9",
  "#4FBDBA",
  "#266B80",
  "#34969E",
  "#48B5AD",
  "#1A5276",
  "#2E8B8B",
]

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

function chartHasData(key: ChartKey, charts: ChartSeriesPayload): boolean {
  switch (key) {
    case "phase":
      return charts.phaseData.length > 0
    case "technology":
      return charts.techData.length > 0
    case "studyType":
      return charts.studyTypeData.length > 0
    case "studyStatus":
      return charts.studyStatusData.length > 0
    case "dose":
      return charts.doseFocusData.length > 0
    case "timeline":
      return charts.timelineData.length > 0
    case "indications":
      return charts.topIndications.length > 0
    case "route":
      return charts.routeData.length > 0
    case "recruitment":
      return charts.recruitmentData.length > 0
    default:
      return false
  }
}

function ChartBlock({ chartKey, charts }: { chartKey: ChartKey; charts: ChartSeriesPayload }) {
  switch (chartKey) {
    case "phase":
      return (
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.phaseData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {charts.phaseData.map((_, i) => (
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
      )
    case "technology":
    case "studyType": {
      const barData = chartKey === "studyType" ? charts.studyTypeData : charts.techData
      return (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ left: 10, right: 16, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fontFamily: "var(--font-mono, monospace)" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={chartKey === "studyType" ? 168 : 132}
                tick={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)" }}
              />
              <Tooltip
                contentStyle={customTooltipStyle}
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as { fullName?: string }
                  return row?.fullName ?? ""
                }}
              />
              <Bar dataKey="value" fill={chartKey === "studyType" ? "#6D28D9" : "#1B4965"} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    }
    case "dose":
      return (
        <div className="h-[270px] min-h-[270px] flex items-center justify-center">
          {charts.doseFocusData.length === 0 ? (
            <p className="font-mono text-sm text-muted-foreground px-6 text-center">
              No intervention detail values in the current filter set.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.doseFocusData}
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
      )
    case "timeline":
      return (
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.timelineData} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
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
      )
    case "indications":
      return (
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={charts.topIndications}
              layout="vertical"
              margin={{ left: 10, right: 16, top: 0, bottom: 0 }}
            >
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
      )
    case "route":
      return (
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.routeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {charts.routeData.map((_, i) => (
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
      )
    case "studyStatus":
      return (
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.studyStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {charts.studyStatusData.map((_, i) => (
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
      )
    case "recruitment":
      return (
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={charts.recruitmentData}
              layout="vertical"
              margin={{ left: 10, right: 16, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fontFamily: "var(--font-mono, monospace)" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={180}
                tick={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)" }}
              />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="value" fill="#0E7490" barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    default:
      return null
  }
}

export function DashboardCharts({
  region,
  charts,
}: {
  region: DashboardRegion
  charts: ChartSeriesPayload
}) {
  const profileCharts = getRegionProfile(region).charts.filter(c => chartHasData(c.key, charts))

  if (profileCharts.length === 0) {
    return (
      <div className="border border-border p-12 text-center">
        <p className="font-mono text-base text-muted-foreground">No trials match the current filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {profileCharts.map(chart => (
        <ChartCard key={chart.key} title={chart.title}>
          <ChartBlock chartKey={chart.key} charts={charts} />
        </ChartCard>
      ))}
    </div>
  )
}
