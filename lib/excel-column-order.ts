/** Column order from `ctri_trials_v2.csv` (current trimmed export). */
export const CTRI_EXCEL_COLUMNS = [
  "_CTRI_No",
  "_Search_Year",
  "_Search_Month",
  "_Detail_URL",
  "CTRI Number",
  "Last Modified On:",
  "Type of Trial",
  "Type of Study",
  "Study Design",
  "Public Title of Study",
  "Scientific Title of Study",
  "Trial Acronym",
  "Source of Monetary or Material Support",
  "Primary Sponsor - Name",
  "Primary Sponsor - Address",
  "Primary Sponsor - Type of Sponsor",
  "Countries of Recruitment",
  "Sites of Study - Name of Principal Investigator",
  "Sites of Study - Name of Site",
  "Sites of Study - Site Address",
  "Details of Ethics Committee - Name of Committee",
  "Details of Ethics Committee - Approval Status",
  "Regulatory Clearance Status from DCGI - Status",
  "Health Condition / Problems Studied - Health Type",
  "Health Condition / Problems Studied - Condition",
  "Intervention / Comparator Agent - Type",
  "Intervention / Comparator Agent - Name",
  "Intervention / Comparator Agent - Details",
  "Inclusion Criteria - Age From",
  "Inclusion Criteria - Age To",
  "Inclusion Criteria - Gender",
  "Inclusion Criteria - Details",
  "ExclusionCriteria - Details",
  "Method of Concealment",
  "Blinding/Masking",
  "Primary Outcome - Outcome",
  "Primary Outcome - TimePoints",
  "Secondary Outcome - Outcome",
  "Secondary Outcome - TimePoints",
  "Target Sample Size",
  "Phase of Trial",
  "Date of First Enrollment (India)",
  "Date of Study Completion (India)",
  "Date of First Enrollment (Global)",
  "Date of Study Completion (Global)",
  "Estimated Duration of Trial",
  "Recruitment Status of Trial (Global)",
  "Recruitment Status of Trial (India)",
  "Publication Details",
  "Individual Participant Data (IPD) Sharing Statement",
  "Brief Summary",
  "Details of Ethics Committee",
] as const

/** Column order from US `final_output_22` Excel / Postgres export. */
export const US_EXCEL_COLUMNS = [
  "NCT_ID",
  "Phase",
  "Enrollment",
  "Study_Start_Date",
  "Primary_Completion_Date",
  "Study_Completion_Date",
  "Duration_Year",
  "Participant_Groups_Arms",
  "Est. Launch date",
  "Dosing_Frequency",
  "Molecule Name",
  "Approved Biologics",
  "Reimbursement",
  "No. of trials",
  "ATC Code",
  "End point parameter",
  "Adherence rate",
  "Drug/Brand switch",
  "INDICATION",
  "Estimated incidence for 2025",
  "Approval Year",
  "Drug Price (drugs.com)",
  "Price Source URL",
  "Dosage/Strength",
  "Adverse Effect",
  "Location Other Than U.S.",
  "Sponsor",
  "Biologics/Biosimilar",
  "Age",
  "Pharmalogical Class",
  "Pharmacological class",
  "trial design",
  "Route of administration",
  "Technology",
  "Disease Condition",
  "Physician/Self Administered",
  "Primary End Point",
  "MARKET FORECAST 2023 (US$ Mn)",
  "MARKET FORECAST 2024 (US$ Mn)",
  "MARKET FORECAST 2025 (US$ Mn)",
  "MARKET FORECAST 2026 (US$ Mn)",
  "MARKET FORECAST 2027 (US$ Mn )",
] as const

export function pickSourceFields(
  row: Record<string, unknown>,
  columns: readonly string[],
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const col of columns) {
    const v = row[col]
    if (v == null) continue
    const s = String(v).trim()
    if (s) out[col] = s
  }
  return out
}

export function mergeSourceFieldMaps(
  ...maps: (Record<string, string> | undefined)[]
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of maps) {
    if (!m) continue
    for (const [k, v] of Object.entries(m)) {
      if (v?.trim()) out[k] = v.trim()
    }
  }
  return out
}

export function parseSourceFieldsJson(raw: unknown): Record<string, string> | undefined {
  if (raw == null || raw === "") return undefined
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, string>
  }
  if (typeof raw !== "string") return undefined
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (v != null && String(v).trim()) out[k] = String(v).trim()
    }
    return Object.keys(out).length ? out : undefined
  } catch {
    return undefined
  }
}
