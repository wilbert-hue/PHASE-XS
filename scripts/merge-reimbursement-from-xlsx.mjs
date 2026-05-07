/**
 * Merges the "Reimbursement" column from an Excel file into app/data/trials.json
 * by matching the NCT ID column to each trial's nctId.
 *
 * Usage:
 *   node scripts/merge-reimbursement-from-xlsx.mjs
 *   node scripts/merge-reimbursement-from-xlsx.mjs "C:\\path\\to\\final_output_22 copy.xlsx"
 *
 * Puts the .xlsx in app/data/ and set DATA_XLSX, or pass the file path as the first argument.
 * Requires: devDependency `xlsx` (already in this project).
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import * as XLSX from "xlsx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const trialsPath = path.join(root, "app", "data", "trials.json")

// Prefer workbook at project root; fallback to app/data (legacy)
const defaultXlsx = fs.existsSync(path.join(root, "final_output_22 copy.xlsx"))
  ? path.join(root, "final_output_22 copy.xlsx")
  : path.join(root, "app", "data", "final_output_22 copy.xlsx")

const xlsxPath = process.argv[2] || process.env.DATA_XLSX || defaultXlsx

function normNct(s) {
  if (s == null || s === "") return null
  const t = String(s).trim()
  const m = t.match(/NCT\d+/i)
  return m ? m[0].toUpperCase() : null
}

function normHeader(h) {
  return String(h ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
}

function cellString(v) {
  if (v == null || v === "") return ""
  if (typeof v === "number" && Number.isFinite(v)) return String(v)
  const s = String(v).trim()
  if (/^n\/a$/i.test(s) || s === "—") return ""
  return s
}

function findColumns(headerRow) {
  let nctCol = -1
  let reimbCol = -1
  for (let c = 0; c < headerRow.length; c++) {
    const h = normHeader(headerRow[c])
    if (nctCol < 0 && (h === "nct id" || h === "nct" || h === "nctid" || h.includes("nct id"))) nctCol = c
    if (reimbCol < 0 && h === "reimbursement") reimbCol = c
  }
  if (nctCol < 0) {
    for (let c = 0; c < headerRow.length; c++) {
      const h = normHeader(headerRow[c]).replace(/_/g, " ")
      if (h === "nct id" || h.includes("nct id") || h.startsWith("nct ")) {
        nctCol = c
        break
      }
    }
  }
  if (nctCol < 0) {
    for (let c = 0; c < headerRow.length; c++) {
      if (normHeader(headerRow[c]).replace(/_/g, "").includes("nct")) {
        nctCol = c
        break
      }
    }
  }
  if (reimbCol < 0) {
    for (let c = 0; c < headerRow.length; c++) {
      if (normHeader(headerRow[c]).includes("reimburse")) {
        reimbCol = c
        break
      }
    }
  }
  return { nctCol, reimbCol }
}

if (!fs.existsSync(xlsxPath)) {
  console.error(`Excel file not found:\n  ${xlsxPath}`)
  console.error(`Copy your spreadsheet to that path, or run:\n  node scripts/merge-reimbursement-from-xlsx.mjs "C:\\\\full\\\\path\\\\to\\\\file.xlsx"`)
  process.exit(1)
}

const buf = fs.readFileSync(xlsxPath)
const wb = XLSX.read(buf, { type: "buffer" })
const sheetName = wb.SheetNames[0]
const sheet = wb.Sheets[sheetName]
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })
if (!rows.length) {
  console.error("Sheet is empty")
  process.exit(1)
}

const headerRow = rows[0]
const { nctCol, reimbCol } = findColumns(headerRow)

if (nctCol < 0 || reimbCol < 0) {
  console.error("Could not find both an NCT column and a Reimbursement column in row 1.")
  console.error("Headers found:", headerRow)
  process.exit(1)
}

const fromSheet = new Map()
let sheetRows = 0
for (let r = 1; r < rows.length; r++) {
  const row = rows[r]
  if (!row || !row.length) continue
  const nct = normNct(row[nctCol])
  if (!nct) continue
  const reimb = cellString(row[reimbCol])
  fromSheet.set(nct, reimb)
  sheetRows++
}

const trials = JSON.parse(fs.readFileSync(trialsPath, "utf8"))
if (!Array.isArray(trials)) {
  console.error("trials.json is not an array")
  process.exit(1)
}

let updated = 0
let notInJson = 0
const missingInSheet = []

for (const [nct] of fromSheet) {
  if (!trials.some((t) => t.nctId === nct)) notInJson++
}

for (const t of trials) {
  if (t.reimbursement === undefined) t.reimbursement = ""
  if (fromSheet.has(t.nctId)) {
    const v = fromSheet.get(t.nctId)
    if (t.reimbursement !== v) {
      t.reimbursement = v
      updated++
    }
  } else {
    missingInSheet.push(t.nctId)
  }
}

fs.writeFileSync(trialsPath, JSON.stringify(trials))

const withValue = trials.filter(
  (t) => t.reimbursement != null && String(t.reimbursement).trim() !== ""
).length

console.log(`Source: ${xlsxPath} (sheet: ${sheetName})`)
console.log(`Rows in sheet with NCT: ${sheetRows}`)
console.log(`Trials in JSON: ${trials.length}`)
console.log(`Reimbursement values set from sheet (rows updated): ${updated}`)
console.log(`NCTs in sheet but not in JSON: ${notInJson}`)
console.log(`Trials in JSON with no row in sheet: ${missingInSheet.length}`)
console.log(`Trials with non-empty reimbursement after merge: ${withValue}`)

if (notInJson > 0) {
  console.log("\nNCTs present in the Excel but missing from trials.json (first 20):")
  let i = 0
  for (const [nct] of fromSheet) {
    if (!trials.some((t) => t.nctId === nct)) {
      console.log(" ", nct)
      if (++i >= 20) break
    }
  }
}
