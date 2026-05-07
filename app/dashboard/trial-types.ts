export interface Trial {
  nctId: string
  phase: string
  enrollment: number
  startDate: string
  primaryCompletionDate: string
  completionDate: string
  durationYears: number
  arms: number
  estLaunchDate: number | null
  dosingFrequency: string
  molecule: string
  approvedBiologics: string
  numTrials: number
  atcCode: string
  endpoints: string
  adherenceRate: number | null
  drugBrandSwitch: string
  indication: string
  incidence2025: number | null
  approvalYear: string
  drugPrice: string
  /** Price Source URL from master spreadsheet (drugs.com etc.) */
  drugPriceUrl: string
  dosageStrength: string
  adverseEffect: string
  locationOther: string
  sponsor: string
  biologicType: string
  age: string
  pharmClass: string
  trialDesign: string
  routeOfAdmin: string
  technology: string
  diseaseCondition: string
  adminType: string
  primaryEndPoint: string
  marketForecast2023: string
  marketForecast2024: string
  marketForecast2025: string
  marketForecast2026: string
  marketForecast2027: string
  /** Payor / access (from source spreadsheet) */
  reimbursement?: string
}

export interface Filters {
  search: string
  phases: string[]
  technologies: string[]
  indications: string[]
  trialDesigns: string[]
  routeOfAdmin: string[]
  adminType: string[]
}

export const defaultFilters: Filters = {
  search: "",
  phases: [],
  technologies: [],
  indications: [],
  trialDesigns: [],
  routeOfAdmin: [],
  adminType: [],
}

/** Case-insensitive trimmed key for counting unique molecules across trials. */
export function normalizeMoleculeKey(molecule: string | undefined | null): string {
  return (molecule ?? "").trim().toLowerCase()
}

const MOLECULE_SEPARATORS = /[/|,;()+]+/g

/**
 * True if the molecule cell lists this INN as its own token (handles combo / regimen strings).
 * `innSearch` is the user query fragment (e.g. "rituximab"). Requires length ≥ 6 to avoid class tokens like "mab".
 */
export function moleculeFieldContainsInn(moleculeRaw: string | undefined | null, innSearch: string): boolean {
  const inn = normalizeMoleculeKey(innSearch)
  if (inn.length < 6) return false
  const m = normalizeMoleculeKey(moleculeRaw)
    .replace(MOLECULE_SEPARATORS, " ")
    .replace(/\s+and\s+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
  const esc = inn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`).test(m)
}

/** Returns a positive price in dollars, or null if missing / invalid / zero. */
export function parseDrugPriceNumber(drugPrice: string | undefined | null): number | null {
  const raw = drugPrice?.trim()
  if (!raw) return null
  const n = parseFloat(raw.replace(/[$,]/g, ""))
  if (Number.isNaN(n) || n <= 0) return null
  return n
}

export function normalizePhase(p: string): string {
  if (!p || p === "Unknown") return "Unknown"
  return p
    .replace(/EARLY_PHASE1/g, "Early Phase 1")
    .replace(/PHASE1/g, "Phase 1")
    .replace(/PHASE2/g, "Phase 2")
    .replace(/PHASE3/g, "Phase 3")
    .replace(/PHASE4/g, "Phase 4")
    .replace(/ \/ /g, " / ")
    .replace(/, /g, " / ")
}
