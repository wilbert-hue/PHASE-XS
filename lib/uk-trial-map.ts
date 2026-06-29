import type { Trial } from "@/app/dashboard/trial-types"
import { parseSourceFieldsJson, pickSourceFields } from "@/lib/excel-column-order"
import { UK_EXCEL_COLUMNS } from "@/lib/uk-excel-columns"
import { isMeaningfulTrialValue } from "@/lib/dashboard-region-profile"
import { truncateForList } from "@/lib/list-text-truncate"

export const UK_DB_TABLE_DEFAULT = "isrctn_uk_trials"

export const UK_DB_COLUMNS = [
  "isrctn_id",
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

export type UkDbColumn = (typeof UK_DB_COLUMNS)[number]

export const UK_DETAIL_COLUMNS = [
  "isrctn_id",
  "brief_summary",
  "secondary_outcomes",
  "outcome_timepoints",
  "intervention_details",
  "source_fields",
] as const

export type UkDetailColumn = (typeof UK_DETAIL_COLUMNS)[number]

function str(v: unknown): string {
  if (v == null) return ""
  return String(v).trim()
}

function firstSegment(raw: string, sep = ","): string {
  const s = str(raw)
  if (!s) return ""
  return s.split(sep)[0]?.trim() || s
}

/** UK dashboard / export: keep interventional trials only. */
export function isUkInterventionalStudyDesign(value: string): boolean {
  return str(value).toLowerCase() === "interventional"
}

export function splitUkHealthConditions(raw: string): string[] {
  return str(raw)
    .split(/[;\n]+/)
    .map(s => s.trim())
    .filter(isMeaningfulTrialValue)
}

export function parseUkEnrollment(raw: string): number {
  const s = str(raw).replace(/,/g, "")
  const n = parseInt(s, 10)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export function normalizeUkPhase(raw: string): string {
  const s = str(raw)
  if (!isMeaningfulTrialValue(s)) return "Unknown"
  return s
    .replace(/\bPhase I\/II\b/gi, "Phase 1/2")
    .replace(/\bPhase II\/III\b/gi, "Phase 2/3")
    .replace(/\bPhase III\/IV\b/gi, "Phase 3/4")
    .replace(/\bPhase I\b/gi, "Phase 1")
    .replace(/\bPhase II\b/gi, "Phase 2")
    .replace(/\bPhase III\b/gi, "Phase 3")
    .replace(/\bPhase IV\b/gi, "Phase 4")
    .replace(/\bNot Applicable\b/gi, "Not Applicable")
    .replace(/\bNot Specified\b/gi, "Not Specified")
}

function yearsBetweenDates(startRaw: string, endRaw: string): number {
  const startYear = startRaw.match(/\b(19|20)\d{2}\b/)?.[0]
  const endYear = endRaw.match(/\b(19|20)\d{2}\b/)?.[0]
  if (!startYear || !endYear) return 0
  const diff = parseInt(endYear, 10) - parseInt(startYear, 10)
  return diff > 0 ? diff : 0
}

/** Map one UK Excel row to `Trial`. */
export function mapUkExcelRow(row: Record<string, unknown>): Trial {
  const record: Record<string, string> = {}
  for (const col of UK_EXCEL_COLUMNS) {
    record[col] = str(row[col])
  }

  const isrctnId = str(record.ISRCTN)
  const drugs = str(record["Drug /biological / vaccine name(s)"])
  const intervention = str(record.Intervention)
  const conditions = splitUkHealthConditions(record["Health condition(s) or problem(s) studied"])
  const submission = str(record["Submission date"])
  const completion = str(record["Completion date"])

  return {
    nctId: isrctnId,
    phase: normalizeUkPhase(record.Phase),
    enrollment: parseUkEnrollment(record["Target sample size at registration"]),
    startDate: submission,
    primaryCompletionDate: "",
    completionDate: completion,
    durationYears: yearsBetweenDates(submission, completion),
    arms: 0,
    estLaunchDate: null,
    dosingFrequency: "",
    molecule: firstSegment(drugs) || firstSegment(intervention, ".") || intervention.slice(0, 120),
    approvedBiologics: "",
    numTrials: 0,
    atcCode: "",
    endpoints: str(record["Primary outcome measure(s)"]),
    adherenceRate: null,
    drugBrandSwitch: "",
    indication: conditions[0] || str(record["Health condition(s) or problem(s) studied"]),
    incidence2025: null,
    approvalYear: "",
    drugPrice: "",
    drugPriceUrl: "",
    dosageStrength: drugs || intervention,
    adverseEffect: "",
    locationOther: str(record["Countries of recruitment"]),
    sponsor: str(record.Sponsor),
    biologicType: str(record.Control),
    age: str(record["Age group"]),
    pharmClass: str(record.Purpose),
    trialDesign: str(record["Overall study status"]) || str(record.Allocation),
    routeOfAdmin: str(record.Assignment),
    technology: str(record.Allocation),
    diseaseCondition: str(record["Condition category"]),
    adminType: str(record["Primary study design"]),
    primaryEndPoint: str(record["Primary outcome measure(s)"]),
    marketForecast2023: "",
    marketForecast2024: "",
    marketForecast2025: "",
    marketForecast2026: "",
    marketForecast2027: "",
    publicTitle: str(record["Study acronym"]) || undefined,
    scientificTitle: str(record["Scientific title"]) || undefined,
    briefSummary: str(record["Primary objective"]) || undefined,
    recruitmentStatus: str(record["Recruitment status"]) || undefined,
    secondaryOutcomes: str(record["Secondary objectives"]) || undefined,
    outcomeTimepoints: str(record["Key secondary outcome measure(s)"]) || undefined,
    blinding: str(record.Masking) || undefined,
    randomization: str(record.Allocation) || undefined,
    genderCriteria: "",
    ctriDetailUrl: str(record.DOI) || undefined,
    sourceFields: pickSourceFields(record, UK_EXCEL_COLUMNS),
  }
}

export function trialToUkListRow(trial: Trial): Record<UkDbColumn, string> {
  return {
    isrctn_id: trial.nctId,
    phase: trial.phase,
    enrollment: String(trial.enrollment ?? 0),
    start_date: trial.startDate,
    completion_date: trial.completionDate,
    duration_years: String(trial.durationYears ?? 0),
    molecule: trial.molecule,
    endpoints: trial.endpoints,
    indication: trial.indication,
    dosage_strength: truncateForList(trial.dosageStrength),
    location_other: truncateForList(trial.locationOther, 120),
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

export function trialToUkDetailRow(trial: Trial): Record<UkDetailColumn, string> {
  return {
    isrctn_id: trial.nctId,
    brief_summary: trial.briefSummary ?? "",
    secondary_outcomes: trial.secondaryOutcomes ?? "",
    outcome_timepoints: trial.outcomeTimepoints ?? "",
    intervention_details: trial.dosageStrength ?? "",
    source_fields: trial.sourceFields ? JSON.stringify(trial.sourceFields) : "",
  }
}

function num(v: unknown): number {
  if (v == null || v === "") return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function mapUkDbRow(row: Record<string, unknown>): Trial {
  return {
    nctId: str(row.isrctn_id),
    phase: normalizeUkPhase(str(row.phase)),
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
    blinding: str(row.blinding) || undefined,
    randomization: str(row.randomization) || undefined,
    genderCriteria: str(row.gender_criteria) || undefined,
    ctriDetailUrl: str(row.registry_url) || undefined,
  }
}

export function mapUkDetailRow(row: Record<string, unknown>): Partial<Trial> {
  const sourceFields = parseSourceFieldsJson(row.source_fields)
  return {
    briefSummary: str(row.brief_summary) || undefined,
    secondaryOutcomes: str(row.secondary_outcomes) || undefined,
    outcomeTimepoints: str(row.outcome_timepoints) || undefined,
    dosageStrength: str(row.intervention_details) || undefined,
    sourceFields,
  }
}

export function applyUkDetailToTrial(base: Trial, detail: Partial<Trial>): Trial {
  return {
    ...base,
    briefSummary: detail.briefSummary ?? base.briefSummary,
    secondaryOutcomes: detail.secondaryOutcomes ?? base.secondaryOutcomes,
    outcomeTimepoints: detail.outcomeTimepoints ?? base.outcomeTimepoints,
    dosageStrength: detail.dosageStrength || base.dosageStrength,
    sourceFields: detail.sourceFields ?? base.sourceFields,
  }
}

export function trialToUkListTrial(trial: Trial): Trial {
  return {
    ...trial,
    dosageStrength: truncateForList(trial.dosageStrength),
    locationOther: truncateForList(trial.locationOther, 120),
    briefSummary: undefined,
    secondaryOutcomes: undefined,
    outcomeTimepoints: undefined,
    sourceFields: undefined,
  }
}
