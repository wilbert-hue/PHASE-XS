import "server-only"

import type { Trial } from "@/app/dashboard/trial-types"
import { loadTrialsFromCtriCsvFile, DEFAULT_CTRI_CSV_PATH } from "@/lib/ctri-csv-load"

const LOG = "[trials-ctri]"

declare global {
  // eslint-disable-next-line no-var
  var __phaseXsCtriTrialsV2: Trial[] | undefined
}

export function loadTrialsFromCtriCsv(): Trial[] {
  if (globalThis.__phaseXsCtriTrialsV2) return globalThis.__phaseXsCtriTrialsV2

  const trials = loadTrialsFromCtriCsvFile(DEFAULT_CTRI_CSV_PATH)
  if (trials.length === 0) {
    console.warn(LOG, "CSV not found or empty at", DEFAULT_CTRI_CSV_PATH)
  } else {
    console.info(LOG, "loaded from CSV", { rows: trials.length, path: DEFAULT_CTRI_CSV_PATH })
  }

  globalThis.__phaseXsCtriTrialsV2 = trials
  return trials
}

export async function fetchTrialsFromCtriCsv(): Promise<Trial[]> {
  return loadTrialsFromCtriCsv()
}
