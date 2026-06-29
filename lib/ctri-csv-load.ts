import "server-only"

import fs from "node:fs"
import path from "node:path"
import type { Trial } from "@/app/dashboard/trial-types"
import { mapCtriCsvRecord } from "@/lib/ctri-trial-map"

export const DEFAULT_CTRI_CSV_PATH = path.join(process.cwd(), "ctri_trials_v2.csv")

/** Normalize legacy / alias CSV header keys onto canonical CTRI column names. */
export function normalizeCtriCsvRecord(row: Record<string, string>): Record<string, string> {
  const out = { ...row }
  const aliases: [string, string][] = [
    ["Detail_URL", "_Detail_URL"],
    ["_CTRI_No,", "_CTRI_No"],
  ]
  for (const [from, to] of aliases) {
    if (out[from]?.trim() && !out[to]?.trim()) out[to] = out[from].trim()
  }
  return out
}

export function parseCtriCsv(content: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let i = 0
  let inQuotes = false

  while (i < content.length) {
    const c = content[i]
    if (inQuotes) {
      if (c === '"') {
        if (content[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += c
      i++
      continue
    }
    if (c === '"') {
      inQuotes = true
      i++
      continue
    }
    if (c === ",") {
      row.push(field)
      field = ""
      i++
      continue
    }
    if (c === "\r") {
      i++
      continue
    }
    if (c === "\n") {
      row.push(field)
      if (row.some(cell => cell.length > 0)) rows.push(row)
      row = []
      field = ""
      i++
      continue
    }
    field += c
    i++
  }
  if (field.length || row.length) {
    row.push(field)
    if (row.some(cell => cell.length > 0)) rows.push(row)
  }
  return rows
}

export function loadTrialsFromCtriCsvFile(csvPath: string = DEFAULT_CTRI_CSV_PATH): Trial[] {
  if (!fs.existsSync(csvPath)) {
    return []
  }

  const raw = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "")
  const table = parseCtriCsv(raw)
  if (table.length < 2) return []

  const headers = table[0].map(h => h.trim())
  const trials: Trial[] = []
  for (let r = 1; r < table.length; r++) {
    const cells = table[r]
    if (!cells.some(c => c.trim())) continue
    const record: Record<string, string> = {}
    headers.forEach((h, i) => {
      record[h] = cells[i] ?? ""
    })
    const trial = mapCtriCsvRecord(normalizeCtriCsvRecord(record))
    if (trial.nctId) trials.push(trial)
  }
  return trials
}
