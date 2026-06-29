import type { Trial } from "@/app/dashboard/trial-types"
import { truncateForList } from "@/lib/list-text-truncate"

/** Heavy US fields stored in `final_output_22_detail`. */
export const US_DETAIL_COLUMNS = [
  "nct_id",
  "adverse_effect",
  "drug_brand_switch",
  "approved_biologics",
  "dosage_strength",
  "location_other",
  "endpoints",
  "market_forecast_2023",
  "market_forecast_2024",
  "market_forecast_2025",
  "market_forecast_2026",
  "market_forecast_2027",
] as const

export type UsDetailColumn = (typeof US_DETAIL_COLUMNS)[number]

function str(v: unknown): string {
  if (v == null) return ""
  return String(v).trim()
}

export function trialToUsDetailRow(trial: Trial): Record<UsDetailColumn, string> {
  return {
    nct_id: trial.nctId,
    adverse_effect: trial.adverseEffect,
    drug_brand_switch: trial.drugBrandSwitch,
    approved_biologics: trial.approvedBiologics,
    dosage_strength: trial.dosageStrength,
    location_other: trial.locationOther,
    endpoints: trial.endpoints,
    market_forecast_2023: trial.marketForecast2023,
    market_forecast_2024: trial.marketForecast2024,
    market_forecast_2025: trial.marketForecast2025,
    market_forecast_2026: trial.marketForecast2026,
    market_forecast_2027: trial.marketForecast2027,
  }
}

/** List row: strip fields that live in the detail table. */
export function trialToUsListRow(trial: Trial): Trial {
  return {
    ...trial,
    dosageStrength: truncateForList(trial.dosageStrength),
    adverseEffect: "",
    drugBrandSwitch: "",
    approvedBiologics: "",
    locationOther: truncateForList(trial.locationOther, 120),
    endpoints: truncateForList(trial.endpoints, 120),
    marketForecast2023: "",
    marketForecast2024: "",
    marketForecast2025: "",
    marketForecast2026: "",
    marketForecast2027: "",
  }
}

export function mapUsDetailRow(row: Record<string, unknown>): Partial<Trial> {
  return {
    adverseEffect: str(row.adverse_effect),
    drugBrandSwitch: str(row.drug_brand_switch),
    approvedBiologics: str(row.approved_biologics),
    dosageStrength: str(row.dosage_strength),
    locationOther: str(row.location_other),
    endpoints: str(row.endpoints),
    marketForecast2023: str(row.market_forecast_2023),
    marketForecast2024: str(row.market_forecast_2024),
    marketForecast2025: str(row.market_forecast_2025),
    marketForecast2026: str(row.market_forecast_2026),
    marketForecast2027: str(row.market_forecast_2027),
  }
}

export function applyUsDetailToTrial(base: Trial, detail: Partial<Trial>): Trial {
  return {
    ...base,
    adverseEffect: detail.adverseEffect || base.adverseEffect,
    drugBrandSwitch: detail.drugBrandSwitch || base.drugBrandSwitch,
    approvedBiologics: detail.approvedBiologics || base.approvedBiologics,
    dosageStrength: detail.dosageStrength || base.dosageStrength,
    locationOther: detail.locationOther || base.locationOther,
    endpoints: detail.endpoints || base.endpoints,
    marketForecast2023: detail.marketForecast2023 || base.marketForecast2023,
    marketForecast2024: detail.marketForecast2024 || base.marketForecast2024,
    marketForecast2025: detail.marketForecast2025 || base.marketForecast2025,
    marketForecast2026: detail.marketForecast2026 || base.marketForecast2026,
    marketForecast2027: detail.marketForecast2027 || base.marketForecast2027,
  }
}
