import type { Trial } from "@/app/dashboard/trial-types"
import { isMeaningfulTrialValue } from "@/lib/dashboard-region-profile"
import { truncateForList } from "@/lib/list-text-truncate"

// ── Config ────────────────────────────────────────────────────────────────────

export interface CtgCountryConfig {
  table: string
  locationCol: string
  excelFile: string
  label: string
}

export const CTG_COUNTRY_CONFIGS: Record<string, CtgCountryConfig> = {
  dk: {
    table: "denmark_cancer_trials",
    locationCol: "Locations in Denmark",
    excelFile: "Denmark_biologic.xlsx",
    label: "Denmark",
  },
  fr: {
    table: "france_cancer_trials",
    locationCol: "Locations in France",
    excelFile: "France_biologic.xlsx",
    label: "France",
  },
  de: {
    table: "germany_cancer_trials",
    locationCol: "Locations in Germany",
    excelFile: "Germany_biologic.xlsx",
    label: "Germany",
  },
  it: {
    table: "italy_cancer_trials",
    locationCol: "Locations in Italy",
    excelFile: "Italy_biologic.xlsx",
    label: "Italy",
  },
  lu: {
    table: "luxembourg_cancer_trials",
    locationCol: "Locations in Luxembourg",
    excelFile: "Luxembourg_biologic.xlsx",
    label: "Luxembourg",
  },
  nl: {
    table: "netherlands_cancer_trials",
    locationCol: "Locations in Netherlands",
    excelFile: "Netherlands_biologic.xlsx",
    label: "Netherlands",
  },
  no: {
    table: "norway_cancer_trials",
    locationCol: "Locations in Norway",
    excelFile: "Norway_biologic.xlsx",
    label: "Norway",
  },
  pl: {
    table: "poland_cancer_trials",
    locationCol: "Locations in Poland",
    excelFile: "Poland_biologic.xlsx",
    label: "Poland",
  },
  ru: {
    table: "russia_cancer_trials",
    locationCol: "Locations in Russia",
    excelFile: "Russia_biologic.xlsx",
    label: "Russia",
  },
  sg: {
    table: "singapore_cancer_trials",
    locationCol: "Locations in Singapore",
    excelFile: "Singapore_biologic.xlsx",
    label: "Singapore",
  },
  kr: {
    table: "south_korea_cancer_trials",
    locationCol: "Locations in South Korea",
    excelFile: "South Korea_biologic.xlsx",
    label: "South Korea",
  },
  se: {
    table: "sweden_cancer_trials",
    locationCol: "Locations in Sweden",
    excelFile: "Sweden_biologic.xlsx",
    label: "Sweden",
  },
}

export function CTG_COUNTRY_TABLE_DEFAULT(regionId: string): string {
  return CTG_COUNTRY_CONFIGS[regionId]?.table ?? `${regionId}_cancer_trials`
}

// ── Column definitions (same schema as Belgium) ───────────────────────────────

export const CTG_COUNTRY_DB_COLUMNS = [
  "nct_id",
  "phase",
  "enrollment",
  "start_date",
  "primary_completion_date",
  "completion_date",
  "duration_years",
  "molecule",
  "endpoints",
  "indication",
  "dosage_strength",
  "location_other",
  "sponsor",
  "biologic_type",
  "age",
  "pharm_class",
  "trial_design",
  "route_of_admin",
  "technology",
  "disease_condition",
  "admin_type",
  "primary_end_point",
  "public_title",
  "scientific_title",
  "recruitment_status",
  "blinding",
  "randomization",
  "gender_criteria",
  "registry_url",
] as const

export type CtgCountryDbColumn = (typeof CTG_COUNTRY_DB_COLUMNS)[number]

export const CTG_COUNTRY_DETAIL_COLUMNS = [
  "nct_id",
  "brief_summary",
  "secondary_outcomes",
  "outcome_timepoints",
  "intervention_details",
  "source_fields",
] as const

export type CtgCountryDetailColumn = (typeof CTG_COUNTRY_DETAIL_COLUMNS)[number]

// ── helpers ───────────────────────────────────────────────────────────────────

function str(v: unknown): string {
  if (v == null) return ""
  return String(v).trim()
}

function num(v: unknown): number {
  if (v == null || v === "") return 0
  const n = Number(str(v).replace(/,/g, ""))
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function yearsBetweenDates(startRaw: string, endRaw: string): number {
  const s = startRaw.match(/\b(19|20)\d{2}\b/)?.[0]
  const e = endRaw.match(/\b(19|20)\d{2}\b/)?.[0]
  if (!s || !e) return 0
  const diff = parseInt(e, 10) - parseInt(s, 10)
  return diff > 0 ? diff : 0
}

export function normalizeCtgCountryPhase(raw: string): string {
  const s = str(raw)
  if (!isMeaningfulTrialValue(s)) return "Not Specified"
  const lo = s.toLowerCase()
  if (/early phase 1/i.test(lo)) return "Early Phase 1"
  if (/phase 1.*phase 2|phase 1\/2/i.test(lo)) return "Phase 1/2"
  if (/phase 2.*phase 3|phase 2\/3/i.test(lo)) return "Phase 2/3"
  if (/phase 3.*phase 4|phase 3\/4/i.test(lo)) return "Phase 3/4"
  if (/phase 4/i.test(lo)) return "Phase 4"
  if (/phase 3/i.test(lo)) return "Phase 3"
  if (/phase 2/i.test(lo)) return "Phase 2"
  if (/phase 1/i.test(lo)) return "Phase 1"
  if (/n\/a|not applicable/i.test(lo)) return "Not Applicable"
  return s
}

export function extractCtgCountryMolecule(raw: string): string {
  if (!raw) return ""
  const parts = raw.split(/[|\n]/).map(s => s.trim()).filter(Boolean)
  for (const part of parts) {
    const cleaned = part
      .replace(
        /^(drug|biological|biologic|procedure|device|radiation|genetic|combination product|dietary supplement|other):\s*/i,
        "",
      )
      .trim()
    if (cleaned) return cleaned
  }
  return raw.split(/[|\n]/)[0]?.trim() || ""
}

function buildAge(minAge: string, maxAge: string): string {
  const min = str(minAge)
  const max = str(maxAge)
  if (min && max && max !== "No Limit") return `${min} – ${max}`
  if (min) return `>= ${min}`
  if (max && max !== "No Limit") return `<= ${max}`
  return ""
}

function mapInterventionModel(model: string, allocation: string): string {
  const m = str(model)
  const a = str(allocation)
  if (m) return m
  if (a === "Randomized") return "Randomized"
  if (a === "Non-Randomized") return "Non-Randomized"
  return "Not Specified"
}

function buildCtgCountrySourceFields(
  row: Record<string, unknown>,
  locationCol: string,
): Record<string, string> {
  const keep = [
    "NCT ID",
    "Brief Title",
    "Official Title",
    "Status",
    "Status Verified Date",
    "Why Stopped",
    "Study First Posted",
    "Start Date",
    "Primary Completion Date",
    "Completion Date",
    "Last Update Posted",
    "Study Type",
    "Phase",
    "Allocation",
    "Intervention Model",
    "Primary Purpose",
    "Masking",
    "Who Masked",
    "Enrollment Count",
    "Enrollment Type",
    "Lead Sponsor",
    "Lead Sponsor Class",
    "Collaborators",
    "Responsible Party Type",
    "Has DMC",
    "FDA Regulated Drug",
    "FDA Regulated Device",
    "Conditions",
    "Keywords",
    "Arm Groups",
    "Interventions",
    "Eligibility Criteria",
    "Sex",
    "Minimum Age",
    "Maximum Age",
    "Healthy Volunteers",
    "Standard Ages",
    locationCol,
    `# ${locationCol}`,
    "Total Locations (all countries)",
    "All Countries Involved",
    "See Also Links",
    "References",
    "Study URL",
  ]
  const out: Record<string, string> = {}
  for (const col of keep) {
    const v = str(row[col])
    if (v) out[col] = v
  }
  return out
}

// ── Excel row → Trial ─────────────────────────────────────────────────────────

export function mapCtgCountryExcelRow(
  row: Record<string, unknown>,
  locationCol: string,
): Trial {
  const get = (col: string) => str(row[col])

  const nctId = get("NCT ID")
  const startDate = get("Start Date") || get("Study First Posted")
  const completionDate = get("Completion Date")
  const primaryCompletionDate = get("Primary Completion Date")
  const conditions = get("Conditions")
  const interventions = get("Interventions")
  const status = get("Status")
  const studyType = get("Study Type")

  return {
    nctId,
    phase: normalizeCtgCountryPhase(get("Phase")),
    enrollment: num(get("Enrollment Count")),
    startDate,
    primaryCompletionDate,
    completionDate,
    durationYears: yearsBetweenDates(startDate, completionDate),
    arms: 0,
    estLaunchDate: null,
    dosingFrequency: "",
    molecule: extractCtgCountryMolecule(interventions),
    approvedBiologics: "",
    numTrials: 0,
    atcCode: "",
    endpoints: get("Primary Purpose"),
    adherenceRate: null,
    drugBrandSwitch: "",
    indication: conditions,
    incidence2025: null,
    approvalYear: "",
    drugPrice: "",
    drugPriceUrl: "",
    dosageStrength: extractCtgCountryMolecule(interventions),
    adverseEffect: "",
    locationOther: get(locationCol),
    sponsor: get("Lead Sponsor"),
    biologicType: "",
    age: buildAge(get("Minimum Age"), get("Maximum Age")),
    pharmClass: get("Study Type"),
    trialDesign: mapInterventionModel(get("Intervention Model"), get("Allocation")),
    routeOfAdmin: "",
    technology: get("Allocation") || studyType,
    diseaseCondition: conditions,
    adminType: studyType || "Interventional",
    primaryEndPoint: get("Primary Purpose"),
    marketForecast2023: "",
    marketForecast2024: "",
    marketForecast2025: "",
    marketForecast2026: "",
    marketForecast2027: "",
    publicTitle: get("Brief Title") || undefined,
    scientificTitle: get("Official Title") || undefined,
    briefSummary: get("Brief Summary") || undefined,
    recruitmentStatus: status || undefined,
    secondaryOutcomes: get("Detailed Description") || undefined,
    outcomeTimepoints: get("Arm Groups") || undefined,
    blinding: get("Masking") || undefined,
    randomization: get("Allocation") || undefined,
    genderCriteria: get("Sex") || undefined,
    ctriDetailUrl: get("Study URL") || undefined,
    sourceFields: buildCtgCountrySourceFields(row, locationCol),
  }
}

// ── Trial → DB row ────────────────────────────────────────────────────────────

export function trialToCtgCountryListRow(trial: Trial): Record<CtgCountryDbColumn, string> {
  return {
    nct_id: trial.nctId,
    phase: trial.phase,
    enrollment: String(trial.enrollment ?? 0),
    start_date: trial.startDate,
    primary_completion_date: trial.primaryCompletionDate,
    completion_date: trial.completionDate,
    duration_years: String(trial.durationYears ?? 0),
    molecule: trial.molecule,
    endpoints: trial.endpoints,
    indication: trial.indication,
    dosage_strength: truncateForList(trial.dosageStrength),
    location_other: truncateForList(trial.locationOther, 160),
    sponsor: trial.sponsor,
    biologic_type: trial.biologicType,
    age: trial.age,
    pharm_class: trial.pharmClass,
    trial_design: trial.trialDesign,
    route_of_admin: trial.routeOfAdmin,
    technology: trial.technology,
    disease_condition: trial.diseaseCondition,
    admin_type: trial.adminType,
    primary_end_point: trial.primaryEndPoint,
    public_title: trial.publicTitle ?? "",
    scientific_title: trial.scientificTitle ?? "",
    recruitment_status: trial.recruitmentStatus ?? "",
    blinding: trial.blinding ?? "",
    randomization: trial.randomization ?? "",
    gender_criteria: trial.genderCriteria ?? "",
    registry_url: trial.ctriDetailUrl ?? "",
  }
}

export function trialToCtgCountryDetailRow(trial: Trial): Record<CtgCountryDetailColumn, string> {
  return {
    nct_id: trial.nctId,
    brief_summary: trial.briefSummary ?? "",
    secondary_outcomes: trial.secondaryOutcomes ?? "",
    outcome_timepoints: trial.outcomeTimepoints ?? "",
    intervention_details: trial.dosageStrength ?? "",
    source_fields: trial.sourceFields ? JSON.stringify(trial.sourceFields) : "",
  }
}

// ── DB row → Trial ────────────────────────────────────────────────────────────

export function mapCtgCountryDbRow(row: Record<string, unknown>): Trial {
  return {
    nctId: str(row.nct_id),
    phase: str(row.phase),
    enrollment: Math.round(num(row.enrollment)),
    startDate: str(row.start_date),
    primaryCompletionDate: str(row.primary_completion_date),
    completionDate: str(row.completion_date),
    durationYears: num(row.duration_years),
    arms: 0,
    estLaunchDate: null,
    dosingFrequency: "",
    molecule: str(row.molecule),
    approvedBiologics: "",
    numTrials: 0,
    atcCode: "",
    endpoints: str(row.endpoints),
    adherenceRate: null,
    drugBrandSwitch: "",
    indication: str(row.indication),
    incidence2025: null,
    approvalYear: "",
    drugPrice: "",
    drugPriceUrl: "",
    dosageStrength: str(row.dosage_strength),
    adverseEffect: "",
    locationOther: str(row.location_other),
    sponsor: str(row.sponsor),
    biologicType: str(row.biologic_type),
    age: str(row.age),
    pharmClass: str(row.pharm_class),
    trialDesign: str(row.trial_design),
    routeOfAdmin: str(row.route_of_admin),
    technology: str(row.technology),
    diseaseCondition: str(row.disease_condition),
    adminType: str(row.admin_type),
    primaryEndPoint: str(row.primary_end_point),
    marketForecast2023: "",
    marketForecast2024: "",
    marketForecast2025: "",
    marketForecast2026: "",
    marketForecast2027: "",
    publicTitle: str(row.public_title) || undefined,
    scientificTitle: str(row.scientific_title) || undefined,
    recruitmentStatus: str(row.recruitment_status) || undefined,
    blinding: str(row.blinding) || undefined,
    randomization: str(row.randomization) || undefined,
    genderCriteria: str(row.gender_criteria) || undefined,
    ctriDetailUrl: str(row.registry_url) || undefined,
  }
}

export function mapCtgCountryDetailRow(row: Record<string, unknown>): Partial<Trial> {
  let sourceFields: Record<string, string> | undefined
  try {
    const raw = str(row.source_fields)
    if (raw) sourceFields = JSON.parse(raw) as Record<string, string>
  } catch {}
  return {
    briefSummary: str(row.brief_summary) || undefined,
    secondaryOutcomes: str(row.secondary_outcomes) || undefined,
    outcomeTimepoints: str(row.outcome_timepoints) || undefined,
    dosageStrength: str(row.intervention_details) || undefined,
    sourceFields,
  }
}

export function applyCtgCountryDetailToTrial(base: Trial, detail: Partial<Trial>): Trial {
  return {
    ...base,
    briefSummary: detail.briefSummary ?? base.briefSummary,
    secondaryOutcomes: detail.secondaryOutcomes ?? base.secondaryOutcomes,
    outcomeTimepoints: detail.outcomeTimepoints ?? base.outcomeTimepoints,
    dosageStrength: detail.dosageStrength || base.dosageStrength,
    sourceFields: detail.sourceFields ?? base.sourceFields,
  }
}

export function trialToCtgCountryListTrial(trial: Trial): Trial {
  return {
    ...trial,
    dosageStrength: truncateForList(trial.dosageStrength),
    locationOther: truncateForList(trial.locationOther, 160),
    briefSummary: undefined,
    secondaryOutcomes: undefined,
    outcomeTimepoints: undefined,
    sourceFields: undefined,
  }
}
