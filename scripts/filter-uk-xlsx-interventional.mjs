/**
 * Keep only Interventional rows in isrctn_uk_cancer_trials_complete.xlsx (in place).
 * npm run data:filter-uk-sheet
 */
import fs from "node:fs"
import path from "node:path"
import XLSX from "xlsx"

const root = process.cwd()
const xlsxPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, "isrctn_uk_cancer_trials_complete.xlsx")

if (!fs.existsSync(xlsxPath)) {
  console.error("File not found:", xlsxPath)
  process.exit(1)
}

const wb = XLSX.readFile(xlsxPath)
const sheetName = wb.SheetNames[0]
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" })
const kept = rows.filter(
  r => String(r["Primary study design"] ?? "").trim().toLowerCase() === "interventional",
)

if (kept.length === 0) {
  console.error("No interventional rows found — aborting.")
  process.exit(1)
}

const out = XLSX.utils.json_to_sheet(kept)
wb.Sheets[sheetName] = out
XLSX.writeFile(wb, xlsxPath)

console.log(
  `Wrote ${kept.length} interventional rows to ${xlsxPath} (removed ${rows.length - kept.length} non-interventional).`,
)
