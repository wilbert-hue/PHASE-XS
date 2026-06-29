import type { Trial } from "@/app/dashboard/trial-types"
import { normalizeCtriId } from "@/lib/ctri-id"
import { CTRI_EXCEL_COLUMNS, parseSourceFieldsJson, pickSourceFields } from "@/lib/excel-column-order"
import { normalizeCtriCsvRecord } from "@/lib/ctri-csv-load"
import { truncateForList } from "@/lib/list-text-truncate"

export const CTRI_DB_TABLE_DEFAULT = "ctri_trials_v2"

/** List/dashboard columns in `phasexs.ctri_trials_v2` (heavy text in `_detail`). */
export const CTRI_DB_COLUMNS = [
  "ctri_id",
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
  "ctri_detail_url",
] as const

export type CtriDbColumn = (typeof CTRI_DB_COLUMNS)[number]

/** On-demand detail in `phasexs.ctri_trials_v2_detail`. */
export const CTRI_DETAIL_COLUMNS = [
  "ctri_id",
  "brief_summary",
  "secondary_outcomes",
  "outcome_timepoints",
  "intervention_details",
  "source_fields",
] as const

export type CtriDetailColumn = (typeof CTRI_DETAIL_COLUMNS)[number]

function str(v: unknown): string {
  if (v == null) return ""
  return String(v).trim()
}

function firstSegment(raw: string, sep = "|"): string {
  const s = str(raw)
  if (!s) return ""
  return s.split(sep)[0]?.trim() || s
}

export function ctriIdFromCsvRecord(row: Record<string, string>): string {
  const rawId =
    str(row["_CTRI_No"]) ||
    str(row["_CTRI_No,"]) ||
    str(row["CTRI Number"])
  return normalizeCtriId(rawId)
}

export function parseCtriEnrollment(raw: string): number {
  const s = str(raw)
  if (!s) return 0
  const india = s.match(/Sample Size from India\s*=\s*"?(\d+)/i)
  if (india) return parseInt(india[1], 10) || 0
  const total = s.match(/Total Sample Size\s*=\s*"?(\d+)/i)
  if (total) return parseInt(total[1], 10) || 0
  const n = parseInt(s.replace(/\D/g, "").slice(0, 8), 10)
  return Number.isFinite(n) ? n : 0
}

export function parseCtriDurationYears(raw: string): number {
  const s = str(raw)
  const y = s.match(/Years\s*=\s*"?(\d+)/i)
  const m = s.match(/Months\s*=\s*"?(\d+)/i)
  const years = y ? parseInt(y[1], 10) : 0
  const months = m ? parseInt(m[1], 10) : 0
  if (years || months) return years + months / 12
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

/** Map one CTRI CSV row (header → value) to `Trial`. */
export function mapCtriCsvRecord(row: Record<string, string>): Trial {
  row = normalizeCtriCsvRecord(row)
  const ctriId = ctriIdFromCsvRecord(row)
  const intervention = str(row["Intervention / Comparator Agent - Name"])
  const interventionType = str(row["Intervention / Comparator Agent - Type"])
  const condition = str(row["Health Condition / Problems Studied - Condition"])
  const studyDesign = str(row["Study Design"])
  const typeOfTrial = str(row["Type of Trial"])
  const typeOfStudy = str(row["Type of Study"])
  const interventionDetails = str(row["Intervention / Comparator Agent - Details"])

  return {
    nctId: ctriId,
    phase: str(row["Phase of Trial"]) || "Unknown",
    enrollment: parseCtriEnrollment(str(row["Target Sample Size"])),
    startDate: str(row["Date of First Enrollment (India)"]),
    primaryCompletionDate: "",
    completionDate: str(row["Date of Study Completion (India)"]),
    durationYears: parseCtriDurationYears(str(row["Estimated Duration of Trial"])),
    arms: 0,
    estLaunchDate: null,
    dosingFrequency: "",
    molecule: firstSegment(intervention),
    approvedBiologics: "",
    numTrials: 0,
    atcCode: "",
    endpoints: str(row["Primary Outcome - Outcome"]),
    adherenceRate: null,
    drugBrandSwitch: "",
    indication: condition.replace(/,\s*$/, ""),
    incidence2025: null,
    approvalYear: "",
    drugPrice: "",
    drugPriceUrl: "",
    dosageStrength: interventionDetails,
    adverseEffect: "",
    locationOther: str(row["Countries of Recruitment"]),
    sponsor: str(row["Primary Sponsor - Name"]),
    biologicType: typeOfTrial,
    age: `${str(row["Inclusion Criteria - Age From"])} – ${str(row["Inclusion Criteria - Age To"])}`.trim(),
    pharmClass: firstSegment(interventionType, "|"),
    trialDesign: studyDesign,
    routeOfAdmin: "",
    technology: typeOfTrial || typeOfStudy,
    diseaseCondition: str(row["Health Condition / Problems Studied - Health Type"]),
    adminType: typeOfStudy,
    primaryEndPoint: str(row["Primary Outcome - Outcome"]),
    marketForecast2023: "",
    marketForecast2024: "",
    marketForecast2025: "",
    marketForecast2026: "",
    marketForecast2027: "",
    publicTitle: str(row["Public Title of Study"]),
    scientificTitle: str(row["Scientific Title of Study"]),
    briefSummary: str(row["Brief Summary"]),
    recruitmentStatus: str(row["Recruitment Status of Trial (India)"]),
    secondaryOutcomes: str(row["Secondary Outcome - Outcome"]),
    outcomeTimepoints: str(row["Primary Outcome - TimePoints"]),
    blinding: str(row["Blinding/Masking"]),
    randomization: "",
    genderCriteria: str(row["Inclusion Criteria - Gender"]),
    ctriDetailUrl: str(row["_Detail_URL"]) || str(row["Detail_URL"]),
    sourceFields: pickSourceFields(row, CTRI_EXCEL_COLUMNS),
  }
}

export function trialToCtriListRow(trial: Trial): Record<CtriDbColumn, string> {
  return {
    ctri_id: trial.nctId,
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
    ctri_detail_url: trial.ctriDetailUrl ?? "",
  }
}

export function trialToCtriDetailRow(trial: Trial): Record<CtriDetailColumn, string> {
  return {
    ctri_id: trial.nctId,
    brief_summary: trial.briefSummary ?? "",
    secondary_outcomes: trial.secondaryOutcomes ?? "",
    outcome_timepoints: trial.outcomeTimepoints ?? "",
    intervention_details: trial.dosageStrength ?? "",
    source_fields: trial.sourceFields ? JSON.stringify(trial.sourceFields) : "",
  }
}

/** @deprecated Use trialToCtriListRow */
export const trialToCtriDbRow = trialToCtriListRow

function num(v: unknown): number {
  if (v == null || v === "") return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/** Map one `ctri_trials_v2` Postgres row to `Trial`. */
export function mapCtriDbRow(row: Record<string, unknown>): Trial {
  return {
    nctId: normalizeCtriId(str(row.ctri_id)),
    phase: str(row.phase) || "Unknown",
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
    ctriDetailUrl: str(row.ctri_detail_url) || undefined,
  }
}

export function mapCtriDetailRow(row: Record<string, unknown>): Partial<Trial> {
  const intervention = str(row.intervention_details)
  const sourceFields = parseSourceFieldsJson(row.source_fields)
  return {
    briefSummary: str(row.brief_summary) || undefined,
    secondaryOutcomes: str(row.secondary_outcomes) || undefined,
    outcomeTimepoints: str(row.outcome_timepoints) || undefined,
    dosageStrength: intervention || undefined,
    sourceFields,
  }
}

export function applyCtriDetailToTrial(base: Trial, detail: Partial<Trial>): Trial {
  return {
    ...base,
    briefSummary: detail.briefSummary ?? base.briefSummary,
    secondaryOutcomes: detail.secondaryOutcomes ?? base.secondaryOutcomes,
    outcomeTimepoints: detail.outcomeTimepoints ?? base.outcomeTimepoints,
    dosageStrength: detail.dosageStrength || base.dosageStrength,
    sourceFields: detail.sourceFields ?? base.sourceFields,
  }
}

/** CSV / fallback: strip heavy fields for list payloads. */
export function trialToCtriListTrial(trial: Trial): Trial {
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
