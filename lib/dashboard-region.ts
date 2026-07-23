export type DashboardRegion = "us" | "in" | "uk" | "es" | "be"

export const DASHBOARD_REGIONS: { id: DashboardRegion; label: string; subtitle: string }[] = [
  { id: "us", label: "United States", subtitle: "US biologics trials (Postgres)" },
  { id: "in", label: "India", subtitle: "CTRI registry (Postgres)" },
  { id: "uk", label: "United Kingdom", subtitle: "ISRCTN cancer trials (Postgres)" },
  { id: "es", label: "Spain", subtitle: "EU CTR cancer trials (Postgres)" },
  { id: "be", label: "Belgium", subtitle: "ClinicalTrials.gov — Belgium sites (Postgres)" },
]

export function parseDashboardRegion(raw: unknown): DashboardRegion {
  if (raw === "in") return "in"
  if (raw === "uk") return "uk"
  if (raw === "es") return "es"
  if (raw === "be") return "be"
  return "us"
}
