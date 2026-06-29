import type { Trial } from "@/app/dashboard/trial-types"
import { isMeaningfulTrialValue } from "@/lib/dashboard-region-profile"
import { truncateForList } from "@/lib/list-text-truncate"

export const SPAIN_DB_TABLE_DEFAULT = "spain_cancer_trials"

export const SPAIN_DB_COLUMNS = [
  "ct_number",
  "phase",
  "enrollment",
  "start_date",
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

export type SpainDbColumn = (typeof SPAIN_DB_COLUMNS)[number]

export const SPAIN_DETAIL_COLUMNS = [
  "ct_number",
  "brief_summary",
  "secondary_outcomes",
  "outcome_timepoints",
  "intervention_details",
  "source_fields",
] as const

export type SpainDetailColumn = (typeof SPAIN_DETAIL_COLUMNS)[number]

// ── helpers ────────────────────────────────────────────────────────────────

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

/**
 * EU CTR phase strings → normalised Phase label.
 * Handles integrated phases and legacy combined strings.
 */
export function normalizeSpainPhase(raw: string): string {
  const s = str(raw)
  if (!isMeaningfulTrialValue(s)) return "Not Specified"

  const lo = s.toLowerCase()

  // Detect integrated / combined phase combos first
  const hasI = /phase\s*i\b/i.test(s)
  const hasII = /phase\s*ii\b/i.test(s)
  const hasIII = /phase\s*iii\b/i.test(s)
  const hasIV = /phase\s*iv\b/i.test(s)

  if (hasI && hasII && !hasIII) return "Phase 1/2"
  if (hasII && hasIII && !hasI && !hasIV) return "Phase 2/3"
  if (hasIII && hasIV) return "Phase 3/4"
  if (hasI && hasIII) return "Phase 1/3"

  if (/human pharmacology/i.test(lo) || /\bphase\s*i\b/i.test(s)) return "Phase 1"
  if (/therapeutic exploratory/i.test(lo) || /\bphase\s*ii\b/i.test(s)) return "Phase 2"
  if (/therapeutic confirmatory/i.test(lo) || /\bphase\s*iii\b/i.test(s)) return "Phase 3"
  if (/therapeutic use/i.test(lo) || /\bphase\s*iv\b/i.test(s)) return "Phase 4"
  if (/not applicable/i.test(lo)) return "Not Applicable"

  return s
}

/**
 * Extract a readable disease category from an EU CTR Therapeutic Area string.
 * e.g. "Diseases [C] - Neoplasms [C04]" → "Neoplasms"
 *      "Diseases [C] - Neoplasms [C04]; Diseases [C] - Respiratory…" → "Neoplasms"
 */
export function parseSpainTherapeuticArea(raw: string): string {
  const s = str(raw)
  if (!isMeaningfulTrialValue(s) || /not possible/i.test(s)) return ""
  // Take first segment when semicolon-separated
  const first = s.split(";")[0]?.trim() || s
  // Remove MeSH codes like [C04], [E02], etc.
  const stripped = first.replace(/\[[A-Z]\d*\d*\]/g, "").trim()
  // Take the part after " - " (the specific disease category)
  const dashPart = stripped.includes(" - ") ? stripped.split(" - ").pop()!.trim() : stripped
  // Final cleanup of trailing punctuation
  return dashPart.replace(/[,;]+$/, "").trim()
}

/**
 * Map Trial Category code to a human-readable study type.
 * EU CTR: 1 = Clinical Trial of a Medicinal Product (interventional), 2 = Other clinical study
 */
function mapTrialCategory(raw: string): string {
  const s = str(raw).trim()
  if (s === "1") return "Interventional"
  if (s === "2") return "Observational / Other"
  return s || "Interventional"
}

/**
 * Extract the first trial site name from the "Trial Sites" field.
 * Format: "Hospital Name | Department | Address | ... || Next Site | ..."
 */
function firstTrialSite(raw: string): string {
  const s = str(raw)
  if (!s) return ""
  return (s.split("||")[0] || s).split("|")[0]?.trim() || ""
}

/** Strip EU CTR product metadata annotations like "[role: inn: cas:]" from drug names. */
export function cleanSpainProductNames(raw: string): string {
  return raw
    .replace(/\s*\[role:[^\]]*\]/gi, "")  // strip [role: inn: cas:] annotations
    .replace(/\s*\|\s*/g, "; ")            // normalise pipe separators to semicolons
    .replace(/;\s*$/, "")                  // trim trailing separator
    .trim()
}

/** Extract the first molecule/product name from a pipe- or semicolon-separated list. */
function firstMolecule(raw: string): string {
  const cleaned = cleanSpainProductNames(str(raw))
  if (!cleaned) return ""
  return cleaned.split(/[;,]/)[0]?.trim() || cleaned
}

// ── Excel row → Trial ──────────────────────────────────────────────────────

export function mapSpainExcelRow(row: Record<string, unknown>): Trial {
  const get = (col: string) => str(row[col])

  const ctNumber = get("CT Number")
  const status = get("Status")
  const startDate = get("EEA Start Date")
  const endDate = get("EEA End Date")
  const products = get("Products")
  const meddra = get("MedDRA Terms")
  const therapeuticArea = get("Therapeutic Area")
  const condition = get("Medical Condition (English)")

  const cleanedProducts = cleanSpainProductNames(products)
  const cleanedMeddra = cleanSpainProductNames(meddra)
  const molecule = firstMolecule(products) || firstMolecule(meddra) || ""

  return {
    nctId: ctNumber,
    phase: normalizeSpainPhase(get("Trial Phase")),
    enrollment: num(get("Total Enrolled")),
    startDate,
    primaryCompletionDate: "",
    completionDate: endDate,
    durationYears: yearsBetweenDates(startDate, endDate),
    arms: 0,
    estLaunchDate: null,
    dosingFrequency: "",
    molecule,
    approvedBiologics: "",
    numTrials: 0,
    atcCode: "",
    endpoints: get("Primary Endpoint"),
    adherenceRate: null,
    drugBrandSwitch: "",
    indication: condition,
    incidence2025: null,
    approvalYear: get("Decision Date (Overall)").slice(0, 4) || "",
    drugPrice: "",
    drugPriceUrl: "",
    dosageStrength: cleanedProducts || cleanedMeddra,
    adverseEffect: "",
    locationOther: firstTrialSite(get("Trial Sites")) || get("Countries / Status"),
    sponsor: get("Sponsor Name"),
    biologicType: "",
    age: get("Age Range (Primary)"),
    pharmClass: parseSpainTherapeuticArea(therapeuticArea),
    trialDesign: status,
    routeOfAdmin: "",
    technology: parseSpainTherapeuticArea(therapeuticArea),
    diseaseCondition: get("Medical Condition (Spanish)"),
    adminType: mapTrialCategory(get("Trial Category")),
    primaryEndPoint: get("Primary Endpoint"),
    marketForecast2023: "",
    marketForecast2024: "",
    marketForecast2025: "",
    marketForecast2026: "",
    marketForecast2027: "",
    publicTitle: get("Public Title") || undefined,
    scientificTitle: get("Short Title / Protocol Code") || undefined,
    briefSummary: get("Main Objective") || undefined,
    recruitmentStatus: status || undefined,
    secondaryOutcomes: get("Secondary Objectives") || undefined,
    outcomeTimepoints: get("Secondary Endpoint") || undefined,
    blinding: undefined,
    randomization: undefined,
    genderCriteria: get("Gender"),
    ctriDetailUrl: get("API URL") || undefined,
    sourceFields: buildSpainSourceFields(row),
  }
}

function buildSpainSourceFields(row: Record<string, unknown>): Record<string, string> {
  const keep = [
    "CT Number", "Status", "Decision Date (Overall)", "Decision Date (per Country)",
    "Publish Date", "Public Title", "Short Title / Protocol Code", "Trial Phase",
    "Trial Category", "Low Intervention Trial", "Medical Condition (English)",
    "Medical Condition (Spanish)", "Is Rare Disease", "Therapeutic Area", "MedDRA Terms",
    "Sponsor Name", "Sponsor Type", "Sponsor Address", "Products",
    "Age Range (Primary)", "Age Range (Secondary Identifier)", "Gender",
    "Clinical Trial Group", "Vulnerable Population",
    "Main Objective", "Secondary Objectives", "Primary Endpoint", "Secondary Endpoint",
    "Principal Inclusion Criteria", "Principal Exclusion Criteria",
    "EEA Start Date", "EEA End Date", "Countries / Status", "Member States Concerned",
    "Total Enrolled", "Results Available", "Last Updated", "API URL",
  ]
  const out: Record<string, string> = {}
  for (const col of keep) {
    const v = str(row[col])
    if (v) out[col] = v
  }
  return out
}

// ── Trial → DB row ─────────────────────────────────────────────────────────

export function trialToSpainListRow(trial: Trial): Record<SpainDbColumn, string> {
  return {
    ct_number: trial.nctId,
    phase: trial.phase,
    enrollment: String(trial.enrollment ?? 0),
    start_date: trial.startDate,
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
    blinding: "",
    randomization: "",
    gender_criteria: trial.genderCriteria ?? "",
    registry_url: trial.ctriDetailUrl ?? "",
  }
}

export function trialToSpainDetailRow(trial: Trial): Record<SpainDetailColumn, string> {
  return {
    ct_number: trial.nctId,
    brief_summary: trial.briefSummary ?? "",
    secondary_outcomes: trial.secondaryOutcomes ?? "",
    outcome_timepoints: trial.outcomeTimepoints ?? "",
    intervention_details: trial.dosageStrength ?? "",
    source_fields: trial.sourceFields ? JSON.stringify(trial.sourceFields) : "",
  }
}

// ── DB row → Trial ─────────────────────────────────────────────────────────

export function mapSpainDbRow(row: Record<string, unknown>): Trial {
  return {
    nctId: str(row.ct_number),
    phase: str(row.phase),
    enrollment: Math.round(num(row.enrollment)),
    startDate: str(row.start_date),
    primaryCompletionDate: "",
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
    blinding: undefined,
    randomization: undefined,
    genderCriteria: str(row.gender_criteria) || undefined,
    ctriDetailUrl: str(row.registry_url) || undefined,
  }
}

export function mapSpainDetailRow(row: Record<string, unknown>): Partial<Trial> {
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

export function applySpainDetailToTrial(base: Trial, detail: Partial<Trial>): Trial {
  return {
    ...base,
    briefSummary: detail.briefSummary ?? base.briefSummary,
    secondaryOutcomes: detail.secondaryOutcomes ?? base.secondaryOutcomes,
    outcomeTimepoints: detail.outcomeTimepoints ?? base.outcomeTimepoints,
    dosageStrength: detail.dosageStrength || base.dosageStrength,
    sourceFields: detail.sourceFields ?? base.sourceFields,
  }
}

export function trialToSpainListTrial(trial: Trial): Trial {
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
