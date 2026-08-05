export type DashboardRegion =
  | "us"
  | "in"
  | "uk"
  | "es"
  | "be"
  | "dk"
  | "fr"
  | "de"
  | "it"
  | "lu"
  | "nl"
  | "no"
  | "pl"
  | "ru"
  | "sg"
  | "kr"
  | "se"

export const DASHBOARD_REGIONS: { id: DashboardRegion; label: string; subtitle: string }[] = [
  { id: "us", label: "United States", subtitle: "US biologics trials (Postgres)" },
  { id: "in", label: "India", subtitle: "CTRI registry (Postgres)" },
  { id: "uk", label: "United Kingdom", subtitle: "ISRCTN cancer trials (Postgres)" },
  { id: "es", label: "Spain", subtitle: "EU CTR cancer trials (Postgres)" },
  { id: "be", label: "Belgium", subtitle: "ClinicalTrials.gov — Belgium sites (Postgres)" },
  { id: "dk", label: "Denmark", subtitle: "ClinicalTrials.gov — Denmark sites (Postgres)" },
  { id: "fr", label: "France", subtitle: "ClinicalTrials.gov — France sites (Postgres)" },
  { id: "de", label: "Germany", subtitle: "ClinicalTrials.gov — Germany sites (Postgres)" },
  { id: "it", label: "Italy", subtitle: "ClinicalTrials.gov — Italy sites (Postgres)" },
  { id: "lu", label: "Luxembourg", subtitle: "ClinicalTrials.gov — Luxembourg sites (Postgres)" },
  { id: "nl", label: "Netherlands", subtitle: "ClinicalTrials.gov — Netherlands sites (Postgres)" },
  { id: "no", label: "Norway", subtitle: "ClinicalTrials.gov — Norway sites (Postgres)" },
  { id: "pl", label: "Poland", subtitle: "ClinicalTrials.gov — Poland sites (Postgres)" },
  { id: "ru", label: "Russia", subtitle: "ClinicalTrials.gov — Russia sites (Postgres)" },
  { id: "sg", label: "Singapore", subtitle: "ClinicalTrials.gov — Singapore sites (Postgres)" },
  { id: "kr", label: "South Korea", subtitle: "ClinicalTrials.gov — South Korea sites (Postgres)" },
  { id: "se", label: "Sweden", subtitle: "ClinicalTrials.gov — Sweden sites (Postgres)" },
]

export function parseDashboardRegion(raw: unknown): DashboardRegion {
  if (raw === "in") return "in"
  if (raw === "uk") return "uk"
  if (raw === "es") return "es"
  if (raw === "be") return "be"
  if (raw === "dk") return "dk"
  if (raw === "fr") return "fr"
  if (raw === "de") return "de"
  if (raw === "it") return "it"
  if (raw === "lu") return "lu"
  if (raw === "nl") return "nl"
  if (raw === "no") return "no"
  if (raw === "pl") return "pl"
  if (raw === "ru") return "ru"
  if (raw === "sg") return "sg"
  if (raw === "kr") return "kr"
  if (raw === "se") return "se"
  return "us"
}
