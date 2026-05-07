/**
 * Rebuilds app/data/trials.json from the master Excel so values match the sheet row-for-row.
 *
 *   node scripts/sync-trials-from-excel.mjs
 *   node scripts/sync-trials-from-excel.mjs "path\\to\\file.xlsx"
 *
 * Default file: final_output_22 copy.xlsx (project root, then app/data fallback).
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import * as XLSX from "xlsx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const outPath = path.join(root, "app", "data", "trials.json")

const defaultXlsx = fs.existsSync(path.join(root, "final_output_22 copy.xlsx"))
  ? path.join(root, "final_output_22 copy.xlsx")
  : path.join(root, "app", "data", "final_output_22 copy.xlsx")

const xlsxPath = process.argv[2] || process.env.DATA_XLSX || defaultXlsx

function str(v) {
  if (v == null) return ""
  if (typeof v === "number" && Number.isFinite(v)) {
    if (Number.isInteger(v) && Math.abs(v) > 1e9) return String(v)
    return String(v)
  }
  return String(v).trim()
}

function intRequired(v) {
  if (v == null || v === "") return 0
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v)
  const t = str(v)
  if (/^n\/a$/i.test(t) || t === "—") return 0
  const n = parseInt(t, 10)
  return Number.isFinite(n) ? n : 0
}

function numOrNull(v) {
  if (v == null || v === "") return null
  if (typeof v === "number" && Number.isFinite(v)) return v
  const t = str(v)
  if (/^n\/a$/i.test(t) || t === "—" || t === "") return null
  const n = parseFloat(t)
  return Number.isFinite(n) ? n : null
}

function intOrNull(v) {
  if (v == null || v === "") return null
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v)
  const t = str(v)
  if (/^n\/a$/i.test(t) || t === "—" || t === "") return null
  const n = parseInt(t, 10)
  return Number.isFinite(n) ? n : null
}

function normNct(s) {
  if (s == null || s === "") return null
  const t = str(s)
  const m = t.match(/NCT\d+/i)
  return m ? m[0].toUpperCase() : null
}

/**
 * Two pharm class columns in the sheet; prefer correctly spelled, then the typo column.
 */
function pickPharmClass(r) {
  const a = str(r[30])
  const b = str(r[29])
  if (a && !/^n\/a$/i.test(a) && a !== "—") return a
  if (b && !/^n\/a$/i.test(b) && b !== "—") return b
  return a || b
}

function rowToTrial(row) {
  const nctId = normNct(row[0])
  if (!nctId) return null

  return {
    nctId,
    phase: str(row[1]),
    enrollment: intRequired(row[2]),
    startDate: str(row[3]),
    primaryCompletionDate: str(row[4]),
    completionDate: str(row[5]),
    durationYears: intRequired(row[6]),
    arms: intRequired(row[7]),
    estLaunchDate: intOrNull(row[8]),
    dosingFrequency: str(row[9]),
    molecule: str(row[10]),
    approvedBiologics: str(row[11]),
    reimbursement: str(row[12]),
    numTrials: intRequired(row[13]),
    atcCode: str(row[14]),
    endpoints: str(row[15]),
    adherenceRate: numOrNull(row[16]),
    drugBrandSwitch: str(row[17]),
    indication: str(row[18]),
    incidence2025: numOrNull(row[19]),
    approvalYear: str(row[20]),
    drugPrice: str(row[21]),
    drugPriceUrl: str(row[22]),
    dosageStrength: str(row[23]),
    adverseEffect: str(row[24]),
    locationOther: str(row[25]),
    sponsor: str(row[26]),
    biologicType: str(row[27]),
    age: str(row[28]),
    pharmClass: pickPharmClass(row),
    trialDesign: str(row[31]),
    routeOfAdmin: str(row[32]),
    technology: str(row[33]),
    diseaseCondition: str(row[34]),
    adminType: str(row[35]),
    primaryEndPoint: str(row[36]),
    marketForecast2023: str(row[37]),
    marketForecast2024: str(row[38]),
    marketForecast2025: str(row[39]),
    marketForecast2026: str(row[40]),
    marketForecast2027: str(row[41]),
  }
}

if (!fs.existsSync(xlsxPath)) {
  console.error("Excel not found:", xlsxPath)
  process.exit(1)
}

const buf = fs.readFileSync(xlsxPath)
const wb = XLSX.read(buf, { type: "buffer" })
const sheet = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })

const trials = []
let skipped = 0
for (let r = 1; r < rows.length; r++) {
  const t = rowToTrial(rows[r])
  if (t) trials.push(t)
  else skipped++
}

if (trials.length === 0) {
  console.error("No valid trial rows were produced")
  process.exit(1)
}

fs.writeFileSync(outPath, JSON.stringify(trials))
console.log(`Wrote ${trials.length} trials to ${outPath}`)
console.log(`Source: ${xlsxPath} (${wb.SheetNames[0]})`)
if (skipped) console.log(`Skipped rows (no NCT): ${skipped}`)
