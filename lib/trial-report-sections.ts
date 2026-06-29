import type { Trial } from "@/app/dashboard/trial-types"
import { normalizePhase } from "@/app/dashboard/trial-types"
import type { DashboardRegion } from "@/lib/dashboard-region"
import { isMeaningfulTrialValue } from "@/lib/dashboard-region-profile"
import { normalizeCtriId } from "@/lib/ctri-id"
import { CTRI_EXCEL_COLUMNS, US_EXCEL_COLUMNS } from "@/lib/excel-column-order"
import { prepareTrialForReport } from "@/lib/trial-source-hydrate"

export type ReportField = { label: string; value: string; items?: string[] }
export type ReportSection = { title: string; fields: ReportField[] }

export type ReportKpi = { label: string; value: string }

export type TrialReportPayload = {
  regionLabel: string
  displayId: string
  molecule: string
  badges: string[]
  kpis: ReportKpi[]
  sections: ReportSection[]
}

type ColumnGroup = { title: string; columns: readonly string[] }

/** US-only — every `final_output_22` column appears exactly once. */
const US_COLUMN_GROUPS: ColumnGroup[] = [
  {
    title: "Trial Identity",
    columns: [
      "NCT_ID",
      "Phase",
      "Molecule Name",
      "Sponsor",
      "Technology",
      "Biologics/Biosimilar",
    ],
  },
  {
    title: "Enrollment & Design",
    columns: [
      "Enrollment",
      "Participant_Groups_Arms",
      "trial design",
      "Route of administration",
      "Physician/Self Administered",
      "Age",
      "Dosing_Frequency",
      "Dosage/Strength",
    ],
  },
  {
    title: "Therapeutic Profile",
    columns: [
      "INDICATION",
      "Disease Condition",
      "Pharmalogical Class",
      "Pharmacological class",
      "Approved Biologics",
      "ATC Code",
    ],
  },
  {
    title: "Outcomes & Safety",
    columns: [
      "Primary End Point",
      "End point parameter",
      "Adherence rate",
      "Adverse Effect",
    ],
  },
  {
    title: "Dates & Timeline",
    columns: [
      "Study_Start_Date",
      "Primary_Completion_Date",
      "Study_Completion_Date",
      "Duration_Year",
      "Est. Launch date",
      "Approval Year",
    ],
  },
  {
    title: "Market & Epidemiology",
    columns: [
      "Estimated incidence for 2025",
      "MARKET FORECAST 2023 (US$ Mn)",
      "MARKET FORECAST 2024 (US$ Mn)",
      "MARKET FORECAST 2025 (US$ Mn)",
      "MARKET FORECAST 2026 (US$ Mn)",
      "MARKET FORECAST 2027 (US$ Mn )",
    ],
  },
  {
    title: "Pricing & Access",
    columns: [
      "Drug Price (drugs.com)",
      "Price Source URL",
      "Drug/Brand switch",
      "Reimbursement",
      "No. of trials",
    ],
  },
  {
    title: "Locations",
    columns: ["Location Other Than U.S."],
  },
]

/** India-only — every `ctri_trials_v2.csv` column appears exactly once. */
const IN_COLUMN_GROUPS: ColumnGroup[] = [
  {
    title: "Registry & Identification",
    columns: [
      "CTRI Number",
      "_Search_Year",
      "_Search_Month",
      "_Detail_URL",
      "Last Modified On:",
      "Trial Acronym",
      "Phase of Trial",
      "Type of Trial",
      "Type of Study",
      "Study Design",
    ],
  },
  {
    title: "Study Titles & Summary",
    columns: [
      "Public Title of Study",
      "Scientific Title of Study",
      "Brief Summary",
    ],
  },
  {
    title: "Health Condition",
    columns: [
      "Health Condition / Problems Studied - Health Type",
      "Health Condition / Problems Studied - Condition",
    ],
  },
  {
    title: "Intervention / Comparator",
    columns: [
      "Intervention / Comparator Agent - Type",
      "Intervention / Comparator Agent - Name",
      "Intervention / Comparator Agent - Details",
    ],
  },
  {
    title: "Eligibility Criteria",
    columns: [
      "Inclusion Criteria - Age From",
      "Inclusion Criteria - Age To",
      "Inclusion Criteria - Gender",
      "Inclusion Criteria - Details",
      "ExclusionCriteria - Details",
    ],
  },
  {
    title: "Study Design & Masking",
    columns: [
      "Method of Concealment",
      "Blinding/Masking",
    ],
  },
  {
    title: "Outcomes",
    columns: [
      "Primary Outcome - Outcome",
      "Primary Outcome - TimePoints",
      "Secondary Outcome - Outcome",
      "Secondary Outcome - TimePoints",
    ],
  },
  {
    title: "Sample Size",
    columns: ["Target Sample Size"],
  },
  {
    title: "Dates & Recruitment",
    columns: [
      "Date of First Enrollment (India)",
      "Date of Study Completion (India)",
      "Date of First Enrollment (Global)",
      "Date of Study Completion (Global)",
      "Recruitment Status of Trial (India)",
      "Recruitment Status of Trial (Global)",
    ],
  },
  {
    title: "Sponsor & Funding",
    columns: [
      "Source of Monetary or Material Support",
      "Primary Sponsor - Name",
      "Primary Sponsor - Address",
      "Primary Sponsor - Type of Sponsor",
      "Countries of Recruitment",
    ],
  },
  {
    title: "Sites & Ethics",
    columns: [
      "Sites of Study - Name of Principal Investigator",
      "Sites of Study - Name of Site",
      "Sites of Study - Site Address",
      "Details of Ethics Committee - Name of Committee",
      "Details of Ethics Committee - Approval Status",
      "Regulatory Clearance Status from DCGI - Status",
      "Details of Ethics Committee",
    ],
  },
  {
    title: "Publications & Data Sharing",
    columns: [
      "Publication Details",
      "Individual Participant Data (IPD) Sharing Statement",
    ],
  },
]

function sf(trial: Trial, key: string): string {
  return trial.sourceFields?.[key]?.trim() ?? ""
}

/** Human-readable PDF labels — values stay exactly as stored in source_fields. */
function formatFieldLabel(column: string): string {
  const labels: Record<string, string> = {
    _CTRI_No: "CTRI No",
    _Search_Year: "Search Year",
    _Search_Month: "Search Month",
    _Detail_URL: "Detail URL",
    "Last Modified On:": "Last Modified On",
  }
  return labels[column] ?? column
}

const INDIA_PDF_SKIP_COLUMNS = new Set(["Estimated Duration of Trial"])

/** Split pipe-delimited registry text into separate list items (addresses, sites, etc.). */
function parsePipeDelimitedList(value: string): string[] | undefined {
  if (!value.includes("|")) return undefined
  const items = value.split(/\s*\|\s*/).map(s => s.trim()).filter(Boolean)
  return items.length > 1 ? items : undefined
}

/** Skip duplicate CTRI ID when clean ID matches registry number. */
function shouldSkipColumn(column: string, trial: Trial): boolean {
  if (INDIA_PDF_SKIP_COLUMNS.has(column)) return true
  if (column !== "_CTRI_No") return false
  const no = sf(trial, "_CTRI_No")
  const num = sf(trial, "CTRI Number")
  if (!no || !num) return true
  return normalizeCtriId(num) === normalizeCtriId(no)
}

function fieldFromColumn(column: string, trial: Trial, includeEmpty: boolean): ReportField | null {
  if (shouldSkipColumn(column, trial)) return null
  const value = sf(trial, column)
  if (!includeEmpty && !isMeaningfulTrialValue(value)) return null
  const items = isMeaningfulTrialValue(value) ? parsePipeDelimitedList(value) : undefined
  return {
    label: formatFieldLabel(column),
    value: isMeaningfulTrialValue(value) ? value : "N/A",
    ...(items ? { items } : {}),
  }
}

function buildSectionsFromColumnGroups(
  trial: Trial,
  groups: ColumnGroup[],
  allColumns: readonly string[],
  includeEmpty = true,
): ReportSection[] {
  const assigned = new Set<string>()
  const sections: ReportSection[] = []

  for (const group of groups) {
    const fields: ReportField[] = []
    for (const col of group.columns) {
      assigned.add(col)
      const f = fieldFromColumn(col, trial, includeEmpty)
      if (f) fields.push(f)
    }
    if (fields.length) sections.push({ title: group.title, fields })
  }

  const remaining = allColumns.filter(col => !assigned.has(col) && !shouldSkipColumn(col, trial))
  if (remaining.length > 0) {
    const fields = remaining
      .map(col => fieldFromColumn(col, trial, includeEmpty))
      .filter((f): f is ReportField => f != null)
    if (fields.length) sections.push({ title: "Additional Fields", fields })
  }

  return sections
}

function buildUsKpis(trial: Trial): ReportKpi[] {
  const kpis: ReportKpi[] = []
  const enrollment = sf(trial, "Enrollment")
  if (isMeaningfulTrialValue(enrollment)) {
    const n = parseInt(enrollment.replace(/\D/g, ""), 10)
    kpis.push({
      label: "Enrollment",
      value: Number.isFinite(n) && n >= 1000 ? `${(n / 1000).toFixed(1)}K` : enrollment,
    })
  }
  const duration = sf(trial, "Duration_Year")
  if (isMeaningfulTrialValue(duration)) {
    kpis.push({ label: "Duration (Years)", value: duration })
  }
  const arms = sf(trial, "Participant_Groups_Arms")
  if (isMeaningfulTrialValue(arms)) kpis.push({ label: "Arms", value: arms })
  const adherence = sf(trial, "Adherence rate")
  if (isMeaningfulTrialValue(adherence)) kpis.push({ label: "Adherence", value: adherence })
  return kpis
}

function buildInKpis(_trial: Trial): ReportKpi[] {
  // India PDF: no summary KPI cards — all fields live in sections as raw source data.
  return []
}

export function buildTrialReportPayload(trial: Trial, region: DashboardRegion): TrialReportPayload {
  const hydrated = prepareTrialForReport(trial, region)
  const isIndia = region === "in"

  if (isIndia) {
    const displayId = normalizeCtriId(
      sf(hydrated, "CTRI Number") || sf(hydrated, "_CTRI_No") || hydrated.nctId,
    )
    const molecule =
      sf(hydrated, "Intervention / Comparator Agent - Name") || hydrated.molecule?.trim() || ""
    const phase = normalizePhase(sf(hydrated, "Phase of Trial") || hydrated.phase)
    const badges: string[] = [phase]
    const typeTrial = sf(hydrated, "Type of Trial")
    const typeStudy = sf(hydrated, "Type of Study")
    if (isMeaningfulTrialValue(typeTrial)) badges.push(`Type: ${typeTrial}`)
    if (isMeaningfulTrialValue(typeStudy)) badges.push(`Study: ${typeStudy}`)
    const recruit = sf(hydrated, "Recruitment Status of Trial (India)")
    if (isMeaningfulTrialValue(recruit)) badges.push(recruit)

    return {
      regionLabel: "CTRI Trial Report (India)",
      displayId,
      molecule,
      badges,
      kpis: buildInKpis(hydrated),
      sections: buildSectionsFromColumnGroups(hydrated, IN_COLUMN_GROUPS, CTRI_EXCEL_COLUMNS, false),
    }
  }

  const displayId = sf(hydrated, "NCT_ID") || hydrated.nctId
  const molecule = sf(hydrated, "Molecule Name") || hydrated.molecule?.trim() || ""
  const phase = normalizePhase(sf(hydrated, "Phase") || hydrated.phase)
  const badges: string[] = [phase]
  const tech = sf(hydrated, "Technology")
  const bio = sf(hydrated, "Biologics/Biosimilar")
  if (isMeaningfulTrialValue(tech)) badges.push(`Tech: ${tech}`)
  if (isMeaningfulTrialValue(bio)) badges.push(`Type: ${bio}`)

  return {
    regionLabel: "US Clinical Trial Report",
    displayId,
    molecule,
    badges,
    kpis: buildUsKpis(hydrated),
    sections: buildSectionsFromColumnGroups(hydrated, US_COLUMN_GROUPS, US_EXCEL_COLUMNS, false),
  }
}

export function trialReportFilename(trial: Trial, region: DashboardRegion): string {
  const isIndia = region === "in"
  const id = isIndia
    ? normalizeCtriId(sf(trial, "_CTRI_No") || sf(trial, "CTRI Number") || trial.nctId)
    : sf(trial, "NCT_ID") || trial.nctId
  const safe = id.replace(/[/\\?%*:|"<>]/g, "-")
  const mol = (
    isIndia
      ? sf(trial, "Intervention / Comparator Agent - Name")
      : sf(trial, "Molecule Name")
  )
    .replace(/[/\\?%*:|"<>]/g, "-")
    .slice(0, 40) || "trial"
  const geo = isIndia ? "IN" : "US"
  return `PHASE-XS_${geo}_${safe}_${mol}.pdf`
}
