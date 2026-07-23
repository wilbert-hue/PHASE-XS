import type { Trial, Filters } from "@/app/dashboard/trial-types"
import {
  normalizePhase,
  normalizeMoleculeKey,
  parseDrugPriceNumber,
  moleculeFieldContainsInn,
} from "@/app/dashboard/trial-types"
import type { DashboardRegion } from "@/lib/dashboard-region"
import {
  getRegionProfile,
  isMeaningfulTrialValue,
  type FilterFacetKey,
} from "@/lib/dashboard-region-profile"
import { facetApplied } from "@/lib/dashboard-facets"
import { splitUkHealthConditions } from "@/lib/uk-trial-map"
import {
  activeSearchTypingSegment,
  buildMoleculeSuggestionCatalog,
  moleculePrefixSuggestions,
} from "@/lib/molecule-suggestions"

export const DASHBOARD_TABLE_PAGE_SIZE = 10

export type DashboardFilterOptions = {
  phases: string[]
  technologies: string[]
  indications: string[]
  trialDesigns: string[]
  routes: string[]
  adminTypes: string[]
  recruitmentStatuses: string[]
}

export type DashboardTableSortField =
  | "nctId"
  | "molecule"
  | "phase"
  | "enrollment"
  | "dosageStrength"
  | "indication"
  | "technology"

export type DashboardQueryInput = {
  filters: Filters
  tablePage: number
  tableSort: { field: DashboardTableSortField; dir: "asc" | "desc" }
}

export type KpiSnapshot = {
  totalEnrollment: number
  avgDuration: string
  uniqueMolecules: number
  uniqueIndications: number
  adherence: string
  avgPrice: string
  moleculesSub: string
}

export type ChartSeriesPayload = {
  phaseData: { name: string; value: number }[]
  techData: { name: string; value: number; fullName: string }[]
  doseFocusData: { fullName: string; name: string; value: number }[]
  timelineData: { year: string; count: number }[]
  topIndications: { name: string; value: number; fullName: string }[]
  routeData: { name: string; value: number }[]
  recruitmentData: { name: string; value: number }[]
  studyTypeData: { name: string; value: number; fullName: string }[]
  studyStatusData: { name: string; value: number }[]
}

export type ComparisonStat = {
  count: number
  totalEnrollment: number
  avgDuration: number
  avgArms: number
  avgAdherence: number
  topPhase: string
  topIndication: string
  topTech: string
}

export type ComparisonGroupPayload = { term: string; summary: ComparisonStat }

export type DashboardQueryResult = {
  totalTrialCount: number
  filterOptions: DashboardFilterOptions
  filteredCount: number
  searchTerms: string[]
  kpi: KpiSnapshot
  charts: ChartSeriesPayload
  comparison: ComparisonGroupPayload[]
  tableRows: Trial[]
  tablePage: number
  tablePageSize: number
  tableTotalPages: number
  moleculeSearchSuggestions: string[]
  moleculeTokenCatalog: string[]
}

function meaningfulStrings(values: (string | undefined)[]): string[] {
  return [...new Set(values.map(v => (v ?? "").trim()).filter(isMeaningfulTrialValue))].sort()
}

export function buildFilterOptions(trials: Trial[], region: DashboardRegion): DashboardFilterOptions {
  const enabled = new Set(getRegionProfile(region).filterFacets.map(f => f.key))
  const phases = enabled.has("phases")
    ? meaningfulStrings(trials.map(t => normalizePhase(t.phase)))
    : []
  const technologies = enabled.has("technologies")
    ? meaningfulStrings(trials.map(t => t.technology))
    : []
  const indMap = new Map<string, number>()
  if (enabled.has("indications")) {
    trials.forEach(t => {
      const tokens =
        region === "uk"
          ? splitUkHealthConditions(t.indication)
          : isMeaningfulTrialValue(t.indication)
            ? [t.indication]
            : []
      for (const cond of tokens) {
        indMap.set(cond, (indMap.get(cond) || 0) + 1)
      }
    })
  }
  const indications = [...indMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(e => e[0])
  const trialDesigns = enabled.has("trialDesigns")
    ? meaningfulStrings(trials.map(t => t.trialDesign))
    : []
  const routes = enabled.has("routeOfAdmin")
    ? meaningfulStrings(trials.flatMap(t => t.routeOfAdmin.split(", ").map(r => r.trim())))
    : []
  const adminTypes = enabled.has("adminType")
    ? meaningfulStrings(trials.map(t => t.adminType))
    : []
  const recruitmentStatuses = enabled.has("recruitmentStatuses")
    ? meaningfulStrings(trials.map(t => t.recruitmentStatus))
    : []
  return { phases, technologies, indications, trialDesigns, routes, adminTypes, recruitmentStatuses }
}

export function matchesSearchTerm(trial: Trial, term: string, region: DashboardRegion): boolean {
  const ls = term.toLowerCase()
  const base =
    trial.nctId.toLowerCase().includes(ls) ||
    trial.molecule.toLowerCase().includes(ls) ||
    trial.indication.toLowerCase().includes(ls) ||
    trial.sponsor.toLowerCase().includes(ls) ||
    trial.diseaseCondition.toLowerCase().includes(ls) ||
    trial.technology.toLowerCase().includes(ls) ||
    trial.trialDesign.toLowerCase().includes(ls)
  if (region === "in") {
    return (
      base ||
      (trial.publicTitle?.toLowerCase().includes(ls) ?? false) ||
      (trial.scientificTitle?.toLowerCase().includes(ls) ?? false) ||
      (trial.recruitmentStatus?.toLowerCase().includes(ls) ?? false)
    )
  }
  if (region === "uk") {
    return (
      base ||
      (trial.scientificTitle?.toLowerCase().includes(ls) ?? false) ||
      (trial.publicTitle?.toLowerCase().includes(ls) ?? false) ||
      (trial.recruitmentStatus?.toLowerCase().includes(ls) ?? false) ||
      (trial.dosageStrength?.toLowerCase().includes(ls) ?? false) ||
      splitUkHealthConditions(trial.indication).some(c => c.toLowerCase().includes(ls))
    )
  }
  if (region === "es" || region === "be") {
    return (
      base ||
      (trial.publicTitle?.toLowerCase().includes(ls) ?? false) ||
      (trial.scientificTitle?.toLowerCase().includes(ls) ?? false) ||
      (trial.recruitmentStatus?.toLowerCase().includes(ls) ?? false) ||
      (trial.dosageStrength?.toLowerCase().includes(ls) ?? false) ||
      (trial.pharmClass?.toLowerCase().includes(ls) ?? false)
    )
  }
  return base || (trial.reimbursement?.toLowerCase() ?? "").includes(ls)
}

function facetValueForTrial(t: Trial, key: FilterFacetKey): string {
  switch (key) {
    case "phases":
      return normalizePhase(t.phase)
    case "technologies":
      return t.technology
    case "indications":
      return t.indication
    case "trialDesigns":
      return t.trialDesign
    case "routeOfAdmin":
      return t.routeOfAdmin
    case "adminType":
      return t.adminType
    case "recruitmentStatuses":
      return t.recruitmentStatus ?? ""
    default:
      return ""
  }
}

export function passesNonSearchFilters(
  t: Trial,
  filters: Filters,
  filterOptions: DashboardFilterOptions,
  region: DashboardRegion,
): boolean {
  for (const facet of getRegionProfile(region).filterFacets) {
    const key = facet.key
    let selected: string[] = []
    let catalog: string[] = []
    switch (key) {
      case "phases":
        selected = filters.phases
        catalog = filterOptions.phases
        break
      case "technologies":
        selected = filters.technologies
        catalog = filterOptions.technologies
        break
      case "indications":
        selected = filters.indications
        catalog = filterOptions.indications
        if (facetApplied(selected, catalog)) {
          const tokens =
            region === "uk" ? splitUkHealthConditions(t.indication) : [t.indication]
          if (!selected.some(ind => tokens.some(tok => tok.toUpperCase().includes(ind.toUpperCase())))) {
            return false
          }
        }
        continue
      case "trialDesigns":
        selected = filters.trialDesigns
        catalog = filterOptions.trialDesigns
        break
      case "routeOfAdmin":
        selected = filters.routeOfAdmin
        catalog = filterOptions.routes
        if (facetApplied(selected, catalog)) {
          if (!selected.some(r => t.routeOfAdmin.includes(r))) return false
        }
        continue
      case "adminType":
        selected = filters.adminType
        catalog = filterOptions.adminTypes
        break
      case "recruitmentStatuses":
        selected = filters.recruitmentStatuses
        catalog = filterOptions.recruitmentStatuses
        break
    }
    if (facetApplied(selected, catalog)) {
      const v = facetValueForTrial(t, key)
      if (!selected.includes(v)) return false
    }
  }
  return true
}

export function filterTrials(
  trials: Trial[],
  filters: Filters,
  filterOptions: DashboardFilterOptions,
  region: DashboardRegion,
): Trial[] {
  const searchTerms = filters.search.split(",").map(s => s.trim()).filter(Boolean)
  return trials.filter(t => {
    if (!passesNonSearchFilters(t, filters, filterOptions, region)) return false
    if (searchTerms.length === 0) return true
    return searchTerms.some(term => matchesSearchTerm(t, term, region))
  })
}

function extractYearFromDate(raw: string): string | null {
  const s = raw.trim()
  if (!isMeaningfulTrialValue(s)) return null
  const iso = s.match(/\b(19|20)\d{2}\b/)
  if (iso) return iso[0]
  const dmy = s.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/)
  if (dmy) return dmy[3]
  return null
}

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

export function computeChartSeries(trials: Trial[], region: DashboardRegion): ChartSeriesPayload {
  const enabled = new Set(getRegionProfile(region).charts.map(c => c.key))
  const phaseMap = new Map<string, number>()
  trials.forEach(t => {
    const p = normalizePhase(t.phase)
    phaseMap.set(p, (phaseMap.get(p) || 0) + 1)
  })
  const phaseData = enabled.has("phase")
    ? [...phaseMap.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    : []

  const techMap = new Map<string, number>()
  trials.forEach(t => {
    if (t.technology) techMap.set(t.technology, (techMap.get(t.technology) || 0) + 1)
  })
  const techData = enabled.has("technology")
    ? [...techMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({
          name: name.length > 25 ? `${name.slice(0, 22)}...` : name,
          value,
          fullName: name,
        }))
    : []

  const studyTypeMap = new Map<string, number>()
  if (enabled.has("studyType")) {
    trials.forEach(t => {
      const st = t.adminType?.trim()
      if (isMeaningfulTrialValue(st)) {
        studyTypeMap.set(st!, (studyTypeMap.get(st!) || 0) + 1)
      }
    })
  }
  const studyTypeData = [...studyTypeMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 28 ? `${name.slice(0, 25)}…` : name,
      value,
      fullName: name,
    }))

  const doseMap = new Map<string, number>()
  trials.forEach(t => {
    if (region === "uk" || region === "es" || region === "be") {
      const raw = (t.dosageStrength || t.molecule || "").trim()
      if (!isMeaningfulTrialValue(raw)) return
      const drugs = raw.split(/[,;]+/).map(s => s.trim()).filter(isMeaningfulTrialValue)
      for (const drug of drugs.slice(0, 4)) {
        const key = drug.toLowerCase().slice(0, 48)
        doseMap.set(key, (doseMap.get(key) || 0) + 1)
      }
      return
    }
    const key = dosageStrengthGroupingKey(t.dosageStrength || "")
    if (!key) return
    doseMap.set(key, (doseMap.get(key) || 0) + 1)
  })
  const doseFocusData = enabled.has("dose")
    ? [...doseMap.entries()]
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
    : []

  const yearMap = new Map<string, number>()
  if (enabled.has("timeline")) {
    trials.forEach(t => {
      const year = extractYearFromDate(t.startDate)
      if (year) yearMap.set(year, (yearMap.get(year) || 0) + 1)
    })
  }
  const timelineData = [...yearMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([year, count]) => ({
    year,
    count,
  }))

  const indMap = new Map<string, number>()
  trials.forEach(t => {
    const tokens =
      region === "uk"
        ? splitUkHealthConditions(t.indication)
        : isMeaningfulTrialValue(t.indication)
          ? [t.indication]
          : []
    for (const cond of tokens) {
      indMap.set(cond, (indMap.get(cond) || 0) + 1)
    }
  })
  const topIndications = enabled.has("indications")
    ? [...indMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({
          name: name.length > 30 ? `${name.slice(0, 27)}...` : name.charAt(0) + name.slice(1).toLowerCase(),
          value,
          fullName: name,
        }))
    : []

  const routeMap = new Map<string, number>()
  if (enabled.has("route")) {
    trials.forEach(t => {
      if (t.routeOfAdmin) {
        const primary = t.routeOfAdmin.split(",")[0].trim()
        if (primary) routeMap.set(primary, (routeMap.get(primary) || 0) + 1)
      }
    })
  }
  const routeData = [...routeMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }))

  const recruitMap = new Map<string, number>()
  if (enabled.has("recruitment")) {
    trials.forEach(t => {
      const rs = t.recruitmentStatus?.trim()
      if (isMeaningfulTrialValue(rs)) {
        recruitMap.set(rs!, (recruitMap.get(rs!) || 0) + 1)
      }
    })
  }
  const recruitmentData = [...recruitMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  const studyStatusMap = new Map<string, number>()
  if (enabled.has("studyStatus")) {
    trials.forEach(t => {
      const status = t.trialDesign?.trim()
      if (isMeaningfulTrialValue(status)) {
        studyStatusMap.set(status!, (studyStatusMap.get(status!) || 0) + 1)
      }
    })
  }
  const studyStatusData = [...studyStatusMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  return {
    phaseData,
    techData,
    doseFocusData,
    timelineData,
    topIndications,
    routeData,
    recruitmentData,
    studyTypeData,
    studyStatusData,
  }
}

export function computeKpiSnapshot(
  trials: Trial[],
  searchTerms: string[],
  region: DashboardRegion,
): KpiSnapshot {
  const profile = getRegionProfile(region)
  const totalEnrollment = trials.reduce((s, t) => s + (t.enrollment || 0), 0)
  const avgDuration = trials.length
    ? (trials.reduce((s, t) => s + (t.durationYears || 0), 0) / trials.length).toFixed(1)
    : "0"

  const singleTerm = searchTerms.length === 1 ? searchTerms[0].trim() : ""
  const innNorm = normalizeMoleculeKey(singleTerm)
  const innCollapse =
    region === "us" &&
    innNorm.length >= 6 &&
    trials.some(t => moleculeFieldContainsInn(t.molecule, singleTerm))

  const moleculeKeys = trials.flatMap(t => {
    const mk = normalizeMoleculeKey(t.molecule)
    if (!mk || !isMeaningfulTrialValue(mk)) return []
    if (innCollapse && moleculeFieldContainsInn(t.molecule, singleTerm)) return [innNorm]
    return [mk]
  })
  const uniqueMolecules = new Set(moleculeKeys).size
  const moleculesSub = innCollapse
    ? "Searched INN in molecule (combos merged)"
    : (profile.kpiCards.find(c => c.key === "molecules")?.sub ?? "Unique compounds")

  const uniqueIndications = new Set(
    trials.map(t => t.indication).filter(v => isMeaningfulTrialValue(v)),
  ).size

  const avgAdherence = trials.filter(t => t.adherenceRate != null)
  const adherence = avgAdherence.length
    ? (avgAdherence.reduce((s, t) => s + t.adherenceRate!, 0) / avgAdherence.length).toFixed(1)
    : "N/A"
  const priceTrials = trials.map(t => parseDrugPriceNumber(t.drugPrice)).filter((n): n is number => n != null)
  const avgPrice = priceTrials.length
    ? (priceTrials.reduce((s, p) => s + p, 0) / priceTrials.length).toFixed(0)
    : "N/A"

  return {
    totalEnrollment,
    avgDuration,
    uniqueMolecules,
    uniqueIndications,
    adherence,
    avgPrice,
    moleculesSub,
  }
}

export function summarizeTrialsForComparison(
  trials: Trial[],
  region: DashboardRegion = "us",
): ComparisonStat {
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
    topTech: region === "uk" ? topOf("adminType") : topOf("technology"),
  }
}

export function computeComparisonPayload(
  allTrials: Trial[],
  filters: Filters,
  filterOptions: DashboardFilterOptions,
  searchTerms: string[],
  region: DashboardRegion,
): ComparisonGroupPayload[] {
  if (searchTerms.length < 2) return []
  return searchTerms.map(term => ({
    term,
    summary: summarizeTrialsForComparison(
      allTrials.filter(
        t =>
          passesNonSearchFilters(t, filters, filterOptions, region) &&
          matchesSearchTerm(t, term, region),
      ),
      region,
    ),
  }))
}

function sortTrialsInPlace(rows: Trial[], field: DashboardTableSortField, dir: "asc" | "desc"): Trial[] {
  const arr = [...rows]
  arr.sort((a, b) => {
    let av: string | number = a[field] ?? ""
    let bv: string | number = b[field] ?? ""
    if (typeof av === "number" && typeof bv === "number") {
      return dir === "asc" ? av - bv : bv - av
    }
    av = String(av).toLowerCase()
    bv = String(bv).toLowerCase()
    return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
  })
  return arr
}

export function runDashboardQuery(
  allTrials: Trial[],
  input: DashboardQueryInput,
  region: DashboardRegion = "us",
): DashboardQueryResult {
  const filterOptions = buildFilterOptions(allTrials, region)
  const filtered = filterTrials(allTrials, input.filters, filterOptions, region)
  const searchTerms = input.filters.search.split(",").map(s => s.trim()).filter(Boolean)
  const kpi = computeKpiSnapshot(filtered, searchTerms, region)
  const charts = computeChartSeries(filtered, region)
  const comparison = computeComparisonPayload(
    allTrials,
    input.filters,
    filterOptions,
    searchTerms,
    region,
  )

  const sorted = sortTrialsInPlace(filtered, input.tableSort.field, input.tableSort.dir)
  const filteredCount = sorted.length
  const tablePageSize = DASHBOARD_TABLE_PAGE_SIZE
  const tableTotalPages = Math.max(1, Math.ceil(filteredCount / tablePageSize))
  const page = Math.min(Math.max(0, input.tablePage), tableTotalPages - 1)
  const tableRows = sorted.slice(page * tablePageSize, (page + 1) * tablePageSize)

  const catalog = buildMoleculeSuggestionCatalog(allTrials)
  const moleculeSearchSuggestions = moleculePrefixSuggestions(
    catalog,
    activeSearchTypingSegment(input.filters.search),
  )
  const moleculeTokenCatalog = [...catalog.values()].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  )

  return {
    totalTrialCount: allTrials.length,
    filterOptions,
    filteredCount,
    searchTerms,
    kpi,
    charts,
    comparison,
    tableRows,
    tablePage: page,
    tablePageSize,
    tableTotalPages,
    moleculeSearchSuggestions,
    moleculeTokenCatalog,
  }
}
