import type { Trial } from "@/app/dashboard/trial-types"
import type { DashboardRegion } from "@/lib/dashboard-region"
import { normalizeCtriId } from "@/lib/ctri-id"
import { mergeSourceFieldMaps } from "@/lib/excel-column-order"
import { isMeaningfulTrialValue } from "@/lib/dashboard-region-profile"

function put(out: Record<string, string>, key: string, value: unknown) {
  if (value == null) return
  const s = String(value).trim()
  if (isMeaningfulTrialValue(s)) out[key] = s
}

/** Rebuild India spreadsheet columns from trial fields + API sourceFields (client-safe). */
export function hydrateCtriSourceFields(trial: Trial): Record<string, string> {
  const fromTrial: Record<string, string> = {}
  const id = normalizeCtriId(trial.nctId)

  put(fromTrial, "_CTRI_No", id)
  put(fromTrial, "CTRI Number", trial.sourceFields?.["CTRI Number"] || id)
  put(fromTrial, "_Search_Year", trial.sourceFields?.["_Search_Year"])
  put(fromTrial, "_Search_Month", trial.sourceFields?.["_Search_Month"])
  put(fromTrial, "_Detail_URL", trial.sourceFields?.["_Detail_URL"] || trial.ctriDetailUrl)
  put(fromTrial, "Last Modified On:", trial.sourceFields?.["Last Modified On:"])
  put(fromTrial, "Trial Acronym", trial.sourceFields?.["Trial Acronym"])
  put(fromTrial, "Phase of Trial", trial.phase)
  put(fromTrial, "Type of Trial", trial.biologicType || trial.technology)
  put(fromTrial, "Type of Study", trial.adminType)
  put(fromTrial, "Study Design", trial.trialDesign)
  put(fromTrial, "Public Title of Study", trial.publicTitle)
  put(fromTrial, "Scientific Title of Study", trial.scientificTitle)
  put(fromTrial, "Brief Summary", trial.briefSummary)
  put(
    fromTrial,
    "Health Condition / Problems Studied - Condition",
    trial.indication,
  )
  put(
    fromTrial,
    "Health Condition / Problems Studied - Health Type",
    trial.diseaseCondition,
  )
  put(
    fromTrial,
    "Intervention / Comparator Agent - Name",
    trial.sourceFields?.["Intervention / Comparator Agent - Name"] || trial.molecule,
  )
  put(fromTrial, "Intervention / Comparator Agent - Type", trial.pharmClass)
  put(fromTrial, "Intervention / Comparator Agent - Details", trial.dosageStrength)
  put(fromTrial, "Primary Outcome - Outcome", trial.primaryEndPoint || trial.endpoints)
  put(fromTrial, "Primary Outcome - TimePoints", trial.outcomeTimepoints)
  put(fromTrial, "Secondary Outcome - Outcome", trial.secondaryOutcomes)
  put(fromTrial, "Primary Sponsor - Name", trial.sponsor)
  put(fromTrial, "Countries of Recruitment", trial.locationOther)
  put(fromTrial, "Date of First Enrollment (India)", trial.startDate)
  put(fromTrial, "Date of Study Completion (India)", trial.completionDate)
  put(fromTrial, "Recruitment Status of Trial (India)", trial.recruitmentStatus)
  put(fromTrial, "Blinding/Masking", trial.blinding)
  put(fromTrial, "Inclusion Criteria - Gender", trial.genderCriteria)

  const ageParts = trial.age?.split("–").map(s => s.trim()) ?? []
  if (ageParts[0]) put(fromTrial, "Inclusion Criteria - Age From", ageParts[0])
  if (ageParts[1]) put(fromTrial, "Inclusion Criteria - Age To", ageParts[1])

  put(
    fromTrial,
    "Target Sample Size",
    trial.sourceFields?.["Target Sample Size"] ||
      (trial.enrollment > 0 ? String(trial.enrollment) : ""),
  )
  put(
    fromTrial,
    "Estimated Duration of Trial",
    trial.sourceFields?.["Estimated Duration of Trial"] ||
      (trial.durationYears > 0 ? String(trial.durationYears) : ""),
  )

  // Spreadsheet columns (sourceFields) take precedence; fromTrial fills mapped gaps.
  return mergeSourceFieldMaps(trial.sourceFields, fromTrial)
}

/** Rebuild US spreadsheet columns from merged trial + stored sourceFields. */
export function hydrateUsSourceFields(trial: Trial): Record<string, string> {
  const fromTrial: Record<string, string> = {}

  put(fromTrial, "NCT_ID", trial.nctId)
  put(fromTrial, "Phase", trial.phase)
  put(fromTrial, "Enrollment", trial.enrollment > 0 ? String(trial.enrollment) : "")
  put(fromTrial, "Study_Start_Date", trial.startDate)
  put(fromTrial, "Primary_Completion_Date", trial.primaryCompletionDate)
  put(fromTrial, "Study_Completion_Date", trial.completionDate)
  put(fromTrial, "Duration_Year", trial.durationYears > 0 ? String(trial.durationYears) : "")
  put(fromTrial, "Participant_Groups_Arms", trial.arms > 0 ? String(trial.arms) : "")
  put(fromTrial, "Est. Launch date", trial.estLaunchDate != null ? String(trial.estLaunchDate) : "")
  put(fromTrial, "Dosing_Frequency", trial.dosingFrequency)
  put(fromTrial, "Molecule Name", trial.molecule)
  put(fromTrial, "Approved Biologics", trial.approvedBiologics)
  put(fromTrial, "Reimbursement", trial.reimbursement)
  put(fromTrial, "No. of trials", trial.numTrials > 0 ? String(trial.numTrials) : "")
  put(fromTrial, "ATC Code", trial.atcCode)
  put(fromTrial, "End point parameter", trial.endpoints)
  put(fromTrial, "Adherence rate", trial.adherenceRate != null ? String(trial.adherenceRate) : "")
  put(fromTrial, "Drug/Brand switch", trial.drugBrandSwitch)
  put(fromTrial, "INDICATION", trial.indication)
  put(
    fromTrial,
    "Estimated incidence for 2025",
    trial.incidence2025 != null ? String(trial.incidence2025) : "",
  )
  put(fromTrial, "Approval Year", trial.approvalYear)
  put(fromTrial, "Drug Price (drugs.com)", trial.drugPrice)
  put(fromTrial, "Price Source URL", trial.drugPriceUrl)
  put(fromTrial, "Dosage/Strength", trial.dosageStrength)
  put(fromTrial, "Adverse Effect", trial.adverseEffect)
  put(fromTrial, "Location Other Than U.S.", trial.locationOther)
  put(fromTrial, "Sponsor", trial.sponsor)
  put(fromTrial, "Biologics/Biosimilar", trial.biologicType)
  put(fromTrial, "Age", trial.age)
  put(fromTrial, "Pharmalogical Class", trial.pharmClass)
  put(fromTrial, "Pharmacological class", trial.pharmClass)
  put(fromTrial, "trial design", trial.trialDesign)
  put(fromTrial, "Route of administration", trial.routeOfAdmin)
  put(fromTrial, "Technology", trial.technology)
  put(fromTrial, "Disease Condition", trial.diseaseCondition)
  put(fromTrial, "Physician/Self Administered", trial.adminType)
  put(fromTrial, "Primary End Point", trial.primaryEndPoint)
  put(fromTrial, "MARKET FORECAST 2023 (US$ Mn)", trial.marketForecast2023)
  put(fromTrial, "MARKET FORECAST 2024 (US$ Mn)", trial.marketForecast2024)
  put(fromTrial, "MARKET FORECAST 2025 (US$ Mn)", trial.marketForecast2025)
  put(fromTrial, "MARKET FORECAST 2026 (US$ Mn)", trial.marketForecast2026)
  put(fromTrial, "MARKET FORECAST 2027 (US$ Mn )", trial.marketForecast2027)

  const merged: Record<string, string> = { ...fromTrial }
  if (trial.sourceFields) {
    for (const [k, v] of Object.entries(trial.sourceFields)) {
      if (isMeaningfulTrialValue(v)) merged[k] = v.trim()
    }
  }

  return merged
}

/** PDF/export: India uses stored spreadsheet columns verbatim; US merges mapped fields. */
export function prepareTrialForReport(trial: Trial, region: DashboardRegion): Trial {
  if (region === "in") {
    return { ...trial, sourceFields: trial.sourceFields ?? {} }
  }
  return { ...trial, sourceFields: hydrateUsSourceFields(trial) }
}
