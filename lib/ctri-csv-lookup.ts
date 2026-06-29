import "server-only"

import fs from "node:fs"
import path from "node:path"
import { normalizeCtriId } from "@/lib/ctri-id"
import { CTRI_EXCEL_COLUMNS, mergeSourceFieldMaps, pickSourceFields } from "@/lib/excel-column-order"
import { DEFAULT_CTRI_CSV_PATH, normalizeCtriCsvRecord, parseCtriCsv } from "@/lib/ctri-csv-load"

let byId: Map<string, Record<string, string>> | null = null

function buildIndex(csvPath: string): Map<string, Record<string, string>> {
  const map = new Map<string, Record<string, string>>()
  if (!fs.existsSync(csvPath)) return map

  const raw = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "")
  const table = parseCtriCsv(raw)
  if (table.length < 2) return map

  const headers = table[0].map(h => h.trim())
  for (let r = 1; r < table.length; r++) {
    const cells = table[r]
    if (!cells.some(c => c.trim())) continue
    const record: Record<string, string> = {}
    headers.forEach((h, i) => {
      record[h] = cells[i] ?? ""
    })
    const normalized = normalizeCtriCsvRecord(record)
    const id =
      normalizeCtriId(
        normalized["_CTRI_No"] ||
          normalized["CTRI Number"] ||
          normalized["_CTRI_No,"] ||
          "",
      )
    if (!id) continue
    map.set(id, pickSourceFields(normalized, CTRI_EXCEL_COLUMNS))
  }
  return map
}

function index(): Map<string, Record<string, string>> {
  if (!byId) {
    byId = buildIndex(DEFAULT_CTRI_CSV_PATH)
  }
  return byId
}

/** Full spreadsheet columns for one CTRI trial (from local CSV). */
export function lookupCtriCsvSourceFields(ctriId: string): Record<string, string> | undefined {
  const id = normalizeCtriId(ctriId)
  if (!id) return undefined
  return index().get(id)
}

/** @deprecated Use mergeSourceFieldMaps */
export const mergeCtriSourceFieldMaps = mergeSourceFieldMaps

/** Clear in-memory CSV index (e.g. after data:sync-ctri in dev). */
export function resetCtriCsvLookupCache(): void {
  byId = null
}
