/**
 * Remove PII / contact columns from ctri_trials_v2.csv (in place).
 * Run: npx tsx scripts/strip-ctri-csv-columns.ts
 */
import fs from "node:fs"
import path from "node:path"
import { DEFAULT_CTRI_CSV_PATH, parseCtriCsv } from "../lib/ctri-csv-load"

const DROP = new Set([
  "Post Graduate Thesis",
  "Secondary IDs if Any - Secondary ID",
  "Secondary IDs if Any - Identifier",
  "Details of Principal Investigator or overall Trial Coordinator (multi-center study) - Name",
  "Details of Principal Investigator or overall Trial Coordinator (multi-center study) - Designation",
  "Details of Principal Investigator or overall Trial Coordinator (multi-center study) - Affiliation",
  "Details of Principal Investigator or overall Trial Coordinator (multi-center study) - Address",
  "Details of Principal Investigator or overall Trial Coordinator (multi-center study) - Phone",
  "Details of Principal Investigator or overall Trial Coordinator (multi-center study) - Fax",
  "Details of Principal Investigator or overall Trial Coordinator (multi-center study) - Email",
  "Details of Contact Person Scientific Query - Name",
  "Details of Contact Person Scientific Query - Designation",
  "Details of Contact Person Scientific Query - Affiliation",
  "Details of Contact Person Scientific Query - Address",
  "Details of Contact Person Scientific Query - Phone",
  "Details of Contact Person Scientific Query - Fax",
  "Details of Contact Person Scientific Query - Email",
  "Details of Contact Person Public Query - Name",
  "Details of Contact Person Public Query - Designation",
  "Details of Contact Person Public Query - Affiliation",
  "Details of Contact Person Public Query - Address",
  "Details of Contact Person Public Query - Phone",
  "Details of Contact Person Public Query - Fax",
  "Details of Contact Person Public Query - Email",
  "Details of Secondary Sponsor - Name",
  "Details of Secondary Sponsor - Address",
  "Sites of Study - Phone/Fax/Email",
  "Method of Generating Random Sequence",
  "Secondary IDs if Any",
])

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function rowToCsvLine(cells: string[]): string {
  return cells.map(escapeCsvField).join(",")
}

function main() {
  const csvPath = path.resolve(DEFAULT_CTRI_CSV_PATH)
  const raw = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "")
  const table = parseCtriCsv(raw)
  if (table.length < 1) {
    console.error("CSV empty")
    process.exit(1)
  }

  const headers = table[0].map(h => h.trim())
  const keepIdx = headers
    .map((h, i) => (DROP.has(h) ? -1 : i))
    .filter(i => i >= 0)

  const removed = headers.filter(h => DROP.has(h))
  const missing = [...DROP].filter(h => !headers.includes(h))
  if (missing.length) {
    console.warn("Columns not found in CSV (skipped):", missing.join("; "))
  }

  const out: string[] = []
  for (let r = 0; r < table.length; r++) {
    const line = keepIdx.map(i => table[r][i] ?? "")
    out.push(rowToCsvLine(line))
  }

  fs.writeFileSync(csvPath, out.join("\n") + "\n", "utf8")
  console.log(
    `Updated ${csvPath}: removed ${removed.length} columns, ${headers.length} → ${keepIdx.length} columns, ${table.length - 1} data rows.`,
  )
}

main()
