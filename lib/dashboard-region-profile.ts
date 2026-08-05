import type { DashboardRegion } from "@/lib/dashboard-region"

export type FilterFacetKey =
  | "phases"
  | "technologies"
  | "indications"
  | "trialDesigns"
  | "routeOfAdmin"
  | "adminType"
  | "recruitmentStatuses"

export type ChartKey =
  | "phase"
  | "technology"
  | "studyType"
  | "studyStatus"
  | "dose"
  | "timeline"
  | "indications"
  | "route"
  | "recruitment"

export type KpiCardKey =
  | "trials"
  | "enrollment"
  | "duration"
  | "molecules"
  | "indications"
  | "adherence"
  | "price"

export type ComparisonMetricKey = "trials" | "enrollment" | "duration" | "arms" | "adherence"

export interface FilterFacetConfig {
  key: FilterFacetKey
  label: string
  accent: string
}

export interface ChartConfig {
  key: ChartKey
  title: string
}

export interface KpiCardConfig {
  key: KpiCardKey
  label: string
  sub: string
}

export interface RegionDashboardProfile {
  region: DashboardRegion
  trialIdLabel: string
  moleculeLabel: string
  searchPlaceholder: string
  footerPrefix: string
  filterFacets: FilterFacetConfig[]
  kpiCards: KpiCardConfig[]
  charts: ChartConfig[]
  comparisonMetrics: ComparisonMetricKey[]
  /** Only show detail fields with real values (no N/A padding). */
  detailHideEmpty: boolean
}

const US_PROFILE: RegionDashboardProfile = {
  region: "us",
  trialIdLabel: "NCT ID",
  moleculeLabel: "Molecule",
  searchPlaceholder:
    "Search by NCT ID, molecule, indication, sponsor, technology…  (use commas to compare: e.g. roche, pfizer)",
  footerPrefix: "PHASE-XS / US Clinical Trials Database",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "technologies", label: "Technology", accent: "#6D28D9" },
    { key: "indications", label: "Indication", accent: "#BE123C" },
    { key: "trialDesigns", label: "Trial Design", accent: "#B45309" },
    { key: "routeOfAdmin", label: "Route of Admin", accent: "#0E7490" },
    { key: "adminType", label: "Administration", accent: "#047857" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    { key: "enrollment", label: "Total Enrollment", sub: "Participants across trials" },
    { key: "duration", label: "Avg Duration", sub: "Mean trial duration" },
    { key: "molecules", label: "Molecules", sub: "Unique compounds" },
    { key: "adherence", label: "Avg Adherence", sub: "Patient compliance" },
    { key: "price", label: "Avg Drug Price", sub: "Average per dose" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "technology", title: "Top Technologies" },
    { key: "dose", title: "Dose Focus" },
    { key: "timeline", title: "Trials Started Over Time" },
    { key: "indications", title: "Top Indications" },
    { key: "route", title: "Route of Administration" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration", "arms", "adherence"],
  detailHideEmpty: false,
}

const IN_PROFILE: RegionDashboardProfile = {
  region: "in",
  trialIdLabel: "CTRI ID",
  moleculeLabel: "Intervention",
  searchPlaceholder:
    "Search by CTRI ID, intervention, condition, sponsor, study design…  (commas to compare)",
  footerPrefix: "PHASE-XS / India CTRI Trials",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Study Design", accent: "#B45309" },
    { key: "adminType", label: "Study Type", accent: "#047857" },
    { key: "recruitmentStatuses", label: "Recruitment", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    {
      key: "enrollment",
      label: "Target Sample Size at Registration",
      sub: "Sum across filtered trials (India)",
    },
    { key: "duration", label: "Avg Duration", sub: "Estimated trial duration" },
    { key: "molecules", label: "Interventions", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique health conditions" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyType", title: "Study Types" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "First Enrollment (India)" },
    { key: "dose", title: "Intervention Details" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const UK_PROFILE: RegionDashboardProfile = {
  region: "uk",
  trialIdLabel: "ISRCTN",
  moleculeLabel: "Drug / Intervention",
  searchPlaceholder:
    "Search by ISRCTN, drug, condition, sponsor, scientific title…  (commas to compare)",
  footerPrefix: "PHASE-XS / UK ISRCTN Cancer Trials",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Health Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Study Status", accent: "#B45309" },
    { key: "recruitmentStatuses", label: "Recruitment", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    {
      key: "enrollment",
      label: "Target Sample Size at Registration",
      sub: "Sum across filtered trials",
    },
    { key: "duration", label: "Avg Duration", sub: "Submission to completion (years)" },
    { key: "molecules", label: "Drugs / Biologics", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique cancer conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyStatus", title: "Overall Study Status" },
    { key: "indications", title: "Top Health Conditions" },
    { key: "timeline", title: "Submissions Over Time" },
    { key: "dose", title: "Top Drugs / Biologics" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const ES_PROFILE: RegionDashboardProfile = {
  region: "es",
  trialIdLabel: "CT Number",
  moleculeLabel: "Product / Drug",
  searchPlaceholder:
    "Search by CT Number, product, condition, sponsor, title…  (commas to compare)",
  footerPrefix: "PHASE-XS / Spain EU CTR Cancer Trials",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Study Status", accent: "#B45309" },
    { key: "recruitmentStatuses", label: "Authorisation Status", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    {
      key: "enrollment",
      label: "Total Enrolled",
      sub: "Sum across filtered trials",
    },
    { key: "duration", label: "Avg Duration", sub: "EEA start to end (years)" },
    { key: "molecules", label: "Products / Drugs", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique cancer conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyStatus", title: "Authorisation Status" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "EEA Start Date Over Time" },
    { key: "dose", title: "Top Products / Drugs" },
    { key: "recruitment", title: "Study Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const BE_PROFILE: RegionDashboardProfile = {
  region: "be",
  trialIdLabel: "NCT ID",
  moleculeLabel: "Drug / Intervention",
  searchPlaceholder:
    "Search by NCT ID, drug, condition, sponsor, trial title…  (commas to compare)",
  footerPrefix: "PHASE-XS / Belgium ClinicalTrials.gov",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Intervention Model", accent: "#B45309" },
    { key: "adminType", label: "Study Type", accent: "#047857" },
    { key: "recruitmentStatuses", label: "Status", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    { key: "enrollment", label: "Total Enrollment", sub: "Enrolled participants" },
    { key: "duration", label: "Avg Duration", sub: "Start to completion (years)" },
    { key: "molecules", label: "Drugs / Biologics", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyType", title: "Study Types" },
    { key: "studyStatus", title: "Trial Status" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "Trials Started Over Time" },
    { key: "dose", title: "Top Drugs / Interventions" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const DK_PROFILE: RegionDashboardProfile = {
  region: "dk",
  trialIdLabel: "NCT ID",
  moleculeLabel: "Drug / Intervention",
  searchPlaceholder:
    "Search by NCT ID, drug, condition, sponsor, trial title…  (commas to compare)",
  footerPrefix: "PHASE-XS / Denmark ClinicalTrials.gov",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Intervention Model", accent: "#B45309" },
    { key: "adminType", label: "Study Type", accent: "#047857" },
    { key: "recruitmentStatuses", label: "Status", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    { key: "enrollment", label: "Total Enrollment", sub: "Enrolled participants" },
    { key: "duration", label: "Avg Duration", sub: "Start to completion (years)" },
    { key: "molecules", label: "Drugs / Biologics", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyType", title: "Study Types" },
    { key: "studyStatus", title: "Trial Status" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "Trials Started Over Time" },
    { key: "dose", title: "Top Drugs / Interventions" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const FR_PROFILE: RegionDashboardProfile = {
  region: "fr",
  trialIdLabel: "NCT ID",
  moleculeLabel: "Drug / Intervention",
  searchPlaceholder:
    "Search by NCT ID, drug, condition, sponsor, trial title…  (commas to compare)",
  footerPrefix: "PHASE-XS / France ClinicalTrials.gov",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Intervention Model", accent: "#B45309" },
    { key: "adminType", label: "Study Type", accent: "#047857" },
    { key: "recruitmentStatuses", label: "Status", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    { key: "enrollment", label: "Total Enrollment", sub: "Enrolled participants" },
    { key: "duration", label: "Avg Duration", sub: "Start to completion (years)" },
    { key: "molecules", label: "Drugs / Biologics", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyType", title: "Study Types" },
    { key: "studyStatus", title: "Trial Status" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "Trials Started Over Time" },
    { key: "dose", title: "Top Drugs / Interventions" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const DE_PROFILE: RegionDashboardProfile = {
  region: "de",
  trialIdLabel: "NCT ID",
  moleculeLabel: "Drug / Intervention",
  searchPlaceholder:
    "Search by NCT ID, drug, condition, sponsor, trial title…  (commas to compare)",
  footerPrefix: "PHASE-XS / Germany ClinicalTrials.gov",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Intervention Model", accent: "#B45309" },
    { key: "adminType", label: "Study Type", accent: "#047857" },
    { key: "recruitmentStatuses", label: "Status", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    { key: "enrollment", label: "Total Enrollment", sub: "Enrolled participants" },
    { key: "duration", label: "Avg Duration", sub: "Start to completion (years)" },
    { key: "molecules", label: "Drugs / Biologics", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyType", title: "Study Types" },
    { key: "studyStatus", title: "Trial Status" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "Trials Started Over Time" },
    { key: "dose", title: "Top Drugs / Interventions" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const IT_PROFILE: RegionDashboardProfile = {
  region: "it",
  trialIdLabel: "NCT ID",
  moleculeLabel: "Drug / Intervention",
  searchPlaceholder:
    "Search by NCT ID, drug, condition, sponsor, trial title…  (commas to compare)",
  footerPrefix: "PHASE-XS / Italy ClinicalTrials.gov",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Intervention Model", accent: "#B45309" },
    { key: "adminType", label: "Study Type", accent: "#047857" },
    { key: "recruitmentStatuses", label: "Status", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    { key: "enrollment", label: "Total Enrollment", sub: "Enrolled participants" },
    { key: "duration", label: "Avg Duration", sub: "Start to completion (years)" },
    { key: "molecules", label: "Drugs / Biologics", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyType", title: "Study Types" },
    { key: "studyStatus", title: "Trial Status" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "Trials Started Over Time" },
    { key: "dose", title: "Top Drugs / Interventions" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const LU_PROFILE: RegionDashboardProfile = {
  region: "lu",
  trialIdLabel: "NCT ID",
  moleculeLabel: "Drug / Intervention",
  searchPlaceholder:
    "Search by NCT ID, drug, condition, sponsor, trial title…  (commas to compare)",
  footerPrefix: "PHASE-XS / Luxembourg ClinicalTrials.gov",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Intervention Model", accent: "#B45309" },
    { key: "adminType", label: "Study Type", accent: "#047857" },
    { key: "recruitmentStatuses", label: "Status", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    { key: "enrollment", label: "Total Enrollment", sub: "Enrolled participants" },
    { key: "duration", label: "Avg Duration", sub: "Start to completion (years)" },
    { key: "molecules", label: "Drugs / Biologics", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyType", title: "Study Types" },
    { key: "studyStatus", title: "Trial Status" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "Trials Started Over Time" },
    { key: "dose", title: "Top Drugs / Interventions" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const NL_PROFILE: RegionDashboardProfile = {
  region: "nl",
  trialIdLabel: "NCT ID",
  moleculeLabel: "Drug / Intervention",
  searchPlaceholder:
    "Search by NCT ID, drug, condition, sponsor, trial title…  (commas to compare)",
  footerPrefix: "PHASE-XS / Netherlands ClinicalTrials.gov",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Intervention Model", accent: "#B45309" },
    { key: "adminType", label: "Study Type", accent: "#047857" },
    { key: "recruitmentStatuses", label: "Status", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    { key: "enrollment", label: "Total Enrollment", sub: "Enrolled participants" },
    { key: "duration", label: "Avg Duration", sub: "Start to completion (years)" },
    { key: "molecules", label: "Drugs / Biologics", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyType", title: "Study Types" },
    { key: "studyStatus", title: "Trial Status" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "Trials Started Over Time" },
    { key: "dose", title: "Top Drugs / Interventions" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const NO_PROFILE: RegionDashboardProfile = {
  region: "no",
  trialIdLabel: "NCT ID",
  moleculeLabel: "Drug / Intervention",
  searchPlaceholder:
    "Search by NCT ID, drug, condition, sponsor, trial title…  (commas to compare)",
  footerPrefix: "PHASE-XS / Norway ClinicalTrials.gov",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Intervention Model", accent: "#B45309" },
    { key: "adminType", label: "Study Type", accent: "#047857" },
    { key: "recruitmentStatuses", label: "Status", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    { key: "enrollment", label: "Total Enrollment", sub: "Enrolled participants" },
    { key: "duration", label: "Avg Duration", sub: "Start to completion (years)" },
    { key: "molecules", label: "Drugs / Biologics", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyType", title: "Study Types" },
    { key: "studyStatus", title: "Trial Status" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "Trials Started Over Time" },
    { key: "dose", title: "Top Drugs / Interventions" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const PL_PROFILE: RegionDashboardProfile = {
  region: "pl",
  trialIdLabel: "NCT ID",
  moleculeLabel: "Drug / Intervention",
  searchPlaceholder:
    "Search by NCT ID, drug, condition, sponsor, trial title…  (commas to compare)",
  footerPrefix: "PHASE-XS / Poland ClinicalTrials.gov",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Intervention Model", accent: "#B45309" },
    { key: "adminType", label: "Study Type", accent: "#047857" },
    { key: "recruitmentStatuses", label: "Status", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    { key: "enrollment", label: "Total Enrollment", sub: "Enrolled participants" },
    { key: "duration", label: "Avg Duration", sub: "Start to completion (years)" },
    { key: "molecules", label: "Drugs / Biologics", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyType", title: "Study Types" },
    { key: "studyStatus", title: "Trial Status" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "Trials Started Over Time" },
    { key: "dose", title: "Top Drugs / Interventions" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const RU_PROFILE: RegionDashboardProfile = {
  region: "ru",
  trialIdLabel: "NCT ID",
  moleculeLabel: "Drug / Intervention",
  searchPlaceholder:
    "Search by NCT ID, drug, condition, sponsor, trial title…  (commas to compare)",
  footerPrefix: "PHASE-XS / Russia ClinicalTrials.gov",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Intervention Model", accent: "#B45309" },
    { key: "adminType", label: "Study Type", accent: "#047857" },
    { key: "recruitmentStatuses", label: "Status", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    { key: "enrollment", label: "Total Enrollment", sub: "Enrolled participants" },
    { key: "duration", label: "Avg Duration", sub: "Start to completion (years)" },
    { key: "molecules", label: "Drugs / Biologics", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyType", title: "Study Types" },
    { key: "studyStatus", title: "Trial Status" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "Trials Started Over Time" },
    { key: "dose", title: "Top Drugs / Interventions" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const SG_PROFILE: RegionDashboardProfile = {
  region: "sg",
  trialIdLabel: "NCT ID",
  moleculeLabel: "Drug / Intervention",
  searchPlaceholder:
    "Search by NCT ID, drug, condition, sponsor, trial title…  (commas to compare)",
  footerPrefix: "PHASE-XS / Singapore ClinicalTrials.gov",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Intervention Model", accent: "#B45309" },
    { key: "adminType", label: "Study Type", accent: "#047857" },
    { key: "recruitmentStatuses", label: "Status", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    { key: "enrollment", label: "Total Enrollment", sub: "Enrolled participants" },
    { key: "duration", label: "Avg Duration", sub: "Start to completion (years)" },
    { key: "molecules", label: "Drugs / Biologics", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyType", title: "Study Types" },
    { key: "studyStatus", title: "Trial Status" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "Trials Started Over Time" },
    { key: "dose", title: "Top Drugs / Interventions" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const KR_PROFILE: RegionDashboardProfile = {
  region: "kr",
  trialIdLabel: "NCT ID",
  moleculeLabel: "Drug / Intervention",
  searchPlaceholder:
    "Search by NCT ID, drug, condition, sponsor, trial title…  (commas to compare)",
  footerPrefix: "PHASE-XS / South Korea ClinicalTrials.gov",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Intervention Model", accent: "#B45309" },
    { key: "adminType", label: "Study Type", accent: "#047857" },
    { key: "recruitmentStatuses", label: "Status", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    { key: "enrollment", label: "Total Enrollment", sub: "Enrolled participants" },
    { key: "duration", label: "Avg Duration", sub: "Start to completion (years)" },
    { key: "molecules", label: "Drugs / Biologics", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyType", title: "Study Types" },
    { key: "studyStatus", title: "Trial Status" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "Trials Started Over Time" },
    { key: "dose", title: "Top Drugs / Interventions" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

const SE_PROFILE: RegionDashboardProfile = {
  region: "se",
  trialIdLabel: "NCT ID",
  moleculeLabel: "Drug / Intervention",
  searchPlaceholder:
    "Search by NCT ID, drug, condition, sponsor, trial title…  (commas to compare)",
  footerPrefix: "PHASE-XS / Sweden ClinicalTrials.gov",
  filterFacets: [
    { key: "phases", label: "Phase", accent: "#2563EB" },
    { key: "indications", label: "Condition", accent: "#BE123C" },
    { key: "trialDesigns", label: "Intervention Model", accent: "#B45309" },
    { key: "adminType", label: "Study Type", accent: "#047857" },
    { key: "recruitmentStatuses", label: "Status", accent: "#0E7490" },
  ],
  kpiCards: [
    { key: "trials", label: "Total Trials", sub: "Filtered results" },
    { key: "enrollment", label: "Total Enrollment", sub: "Enrolled participants" },
    { key: "duration", label: "Avg Duration", sub: "Start to completion (years)" },
    { key: "molecules", label: "Drugs / Biologics", sub: "Unique intervention names" },
    { key: "indications", label: "Conditions", sub: "Unique conditions studied" },
  ],
  charts: [
    { key: "phase", title: "Trials by Phase" },
    { key: "studyType", title: "Study Types" },
    { key: "studyStatus", title: "Trial Status" },
    { key: "indications", title: "Top Conditions" },
    { key: "timeline", title: "Trials Started Over Time" },
    { key: "dose", title: "Top Drugs / Interventions" },
    { key: "recruitment", title: "Recruitment Status" },
  ],
  comparisonMetrics: ["trials", "enrollment", "duration"],
  detailHideEmpty: true,
}

export function getRegionProfile(region: DashboardRegion): RegionDashboardProfile {
  if (region === "in") return IN_PROFILE
  if (region === "uk") return UK_PROFILE
  if (region === "es") return ES_PROFILE
  if (region === "be") return BE_PROFILE
  if (region === "dk") return DK_PROFILE
  if (region === "fr") return FR_PROFILE
  if (region === "de") return DE_PROFILE
  if (region === "it") return IT_PROFILE
  if (region === "lu") return LU_PROFILE
  if (region === "nl") return NL_PROFILE
  if (region === "no") return NO_PROFILE
  if (region === "pl") return PL_PROFILE
  if (region === "ru") return RU_PROFILE
  if (region === "sg") return SG_PROFILE
  if (region === "kr") return KR_PROFILE
  if (region === "se") return SE_PROFILE
  return US_PROFILE
}

/** Values that are placeholders in CTRI exports, not real data. */
export function isMeaningfulTrialValue(value: string | number | null | undefined): boolean {
  if (value == null) return false
  if (typeof value === "number") return Number.isFinite(value)
  const s = String(value).trim()
  if (!s) return false
  if (/^(n\/?a|na|nil|none|not applicable|not specified|—|-)$/i.test(s)) return false
  if (/date missing|applicable only for completed|not available/i.test(s)) return false
  return true
}
