import type { Trial } from "@/app/dashboard/trial-types"
import { truncateForList } from "@/lib/list-text-truncate"

function str(v: unknown): string {
  if (v == null) return ""
  return String(v).trim()
}

function num(v: unknown): number {
  if (v == null || v === "") return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function numOrNull(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function intOrNullFromText(v: unknown): number | null {
  if (v == null || v === "") return null
  const s = String(v).trim()
  const m = s.match(/-?\d+/)
  if (!m) return null
  const n = parseInt(m[0], 10)
  return Number.isFinite(n) ? n : null
}

export function mapRowToTrial(row: Record<string, unknown>): Trial {
  const pharm =
    str(row["Pharmalogical Class"]) || str(row["Pharmacological class"])

  return {
    nctId: str(row["NCT_ID"]),
    phase: str(row["Phase"]),
    enrollment: Math.round(num(row["Enrollment"])),
    startDate: str(row["Study_Start_Date"]),
    primaryCompletionDate: str(row["Primary_Completion_Date"]),
    completionDate: str(row["Study_Completion_Date"]),
    durationYears: num(row["Duration_Year"]),
    arms: Math.round(num(row["Participant_Groups_Arms"])),
    estLaunchDate: intOrNullFromText(row["Est. Launch date"]),
    dosingFrequency: str(row["Dosing_Frequency"]),
    molecule: str(row["Molecule Name"]),
    approvedBiologics: str(row["Approved Biologics"]),
    reimbursement: str(row["Reimbursement"]) || undefined,
    numTrials: Math.round(num(row["No. of trials"])),
    atcCode: str(row["ATC Code"]),
    endpoints: str(row["End point parameter"]),
    adherenceRate: numOrNull(row["Adherence rate"]),
    drugBrandSwitch: str(row["Drug/Brand switch"]),
    indication: str(row["INDICATION"]),
    incidence2025: numOrNull(row["Estimated incidence for 2025"]),
    approvalYear: str(row["Approval Year"]),
    drugPrice: str(row["Drug Price (drugs.com)"]),
    drugPriceUrl: str(row["Price Source URL"]),
    dosageStrength: str(row["Dosage/Strength"]),
    adverseEffect: str(row["Adverse Effect"]),
    locationOther: str(row["Location Other Than U.S."]),
    sponsor: str(row["Sponsor"]),
    biologicType: str(row["Biologics/Biosimilar"]),
    age: str(row["Age"]),
    pharmClass: pharm,
    trialDesign: str(row["trial design"]),
    routeOfAdmin: str(row["Route of administration"]),
    technology: str(row["Technology"]),
    diseaseCondition: str(row["Disease Condition"]),
    adminType: str(row["Physician/Self Administered"]),
    primaryEndPoint: str(row["Primary End Point"]),
    marketForecast2023: str(row["MARKET FORECAST 2023 (US$ Mn)"]),
    marketForecast2024: str(row["MARKET FORECAST 2024 (US$ Mn)"]),
    marketForecast2025: str(row["MARKET FORECAST 2025 (US$ Mn)"]),
    marketForecast2026: str(row["MARKET FORECAST 2026 (US$ Mn)"]),
    marketForecast2027: str(row["MARKET FORECAST 2027 (US$ Mn )"]),
  }
}

export const SELECT_TRIALS_LIST_SQL = `
  SELECT
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
    "Reimbursement",
    "No. of trials",
    "ATC Code",
    "Adherence rate",
    "INDICATION",
    "Estimated incidence for 2025",
    "Approval Year",
    "Drug Price (drugs.com)",
    "Price Source URL",
    "Dosage/Strength",
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
    "Primary End Point"
  FROM`

export const SELECT_TRIALS_FULL_SQL = `
  SELECT
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
    "MARKET FORECAST 2027 (US$ Mn )"
  FROM`

export function mapRowToTrialList(row: Record<string, unknown>): Trial {
  const full = mapRowToTrial(row)
  return {
    ...full,
    approvedBiologics: "",
    endpoints: truncateForList(full.endpoints, 120),
    drugBrandSwitch: "",
    dosageStrength: truncateForList(full.dosageStrength),
    adverseEffect: "",
    locationOther: truncateForList(full.locationOther, 120),
    marketForecast2023: "",
    marketForecast2024: "",
    marketForecast2025: "",
    marketForecast2026: "",
    marketForecast2027: "",
  }
}
