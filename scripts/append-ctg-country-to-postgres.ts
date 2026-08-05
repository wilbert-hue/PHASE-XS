/**
 * Load a ClinicalTrials.gov country dataset from Excel into Postgres.
 *
 * Usage:
 *   npm run data:sync-dk               # Denmark (default path)
 *   npm run data:sync-fr               # France
 *   npx tsx scripts/append-ctg-country-to-postgres.ts dk
 *   npx tsx scripts/append-ctg-country-to-postgres.ts dk path/to/Denmark_biologic.xlsx
 *
 * Supported region IDs: dk, fr, de, it, lu, nl, no, pl, ru, sg, kr, se
 */
import fs from "node:fs"
import path from "node:path"
import XLSX from "xlsx"
import {
  CTG_COUNTRY_CONFIGS,
  CTG_COUNTRY_DB_COLUMNS,
  CTG_COUNTRY_DETAIL_COLUMNS,
  CTG_COUNTRY_TABLE_DEFAULT,
  mapCtgCountryExcelRow,
  trialToCtgCountryDetailRow,
  trialToCtgCountryListRow,
} from "../lib/ctg-country-trial-map"
import { ensureSchema, getPool, getSchemaTableNames } from "../lib/postgres-client"

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return
  const text = fs.readFileSync(filePath, "utf8")
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "")
    }
  }
}

function fq(schema: string, table: string): string {
  return `"${schema.replace(/"/g, '""')}"."${table.replace(/"/g, '""')}"`
}

function loadTrialsFromXlsx(xlsxPath: string, locationCol: string, label: string) {
  const wb = XLSX.readFile(xlsxPath)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })
  const mapped = rows
    .map(row => mapCtgCountryExcelRow(row, locationCol))
    .filter(t => t.nctId)
  console.log(`${label} rows: ${rows.length} total → ${mapped.length} with NCT ID`)
  return mapped
}

async function main(): Promise<void> {
  const root = process.cwd()
  loadEnvFile(path.join(root, ".env.local"))
  loadEnvFile(path.join(root, ".env"))

  const regionId = process.argv[2]?.toLowerCase()
  if (!regionId) {
    console.error("Usage: npx tsx scripts/append-ctg-country-to-postgres.ts <regionId> [xlsxPath]")
    console.error("Region IDs:", Object.keys(CTG_COUNTRY_CONFIGS).join(", "))
    process.exit(1)
  }

  const config = CTG_COUNTRY_CONFIGS[regionId]
  if (!config) {
    console.error(`Unknown region ID: ${regionId}`)
    console.error("Supported:", Object.keys(CTG_COUNTRY_CONFIGS).join(", "))
    process.exit(1)
  }

  const xlsxPath = process.argv[3]
    ? path.resolve(process.argv[3])
    : path.join(root, "Pol-xs", "ct-scraper", "output", config.excelFile)

  if (!fs.existsSync(xlsxPath)) {
    console.error("Excel file not found:", xlsxPath)
    process.exit(1)
  }

  const trials = loadTrialsFromXlsx(xlsxPath, config.locationCol, config.label)
  if (trials.length === 0) {
    console.error(`No ${config.label} trials loaded from`, xlsxPath)
    process.exit(1)
  }

  const envVar = `POSTGRES_${regionId.toUpperCase()}_TABLE`
  const table = (process.env[envVar]?.trim()) || CTG_COUNTRY_TABLE_DEFAULT(regionId)
  const detailTable = `${table}_detail`
  const { schema } = getSchemaTableNames(table)
  const pool = getPool()

  await ensureSchema(pool, schema)

  const fqMain = fq(schema, table)
  const fqDetail = fq(schema, detailTable)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${fqMain} (
      nct_id TEXT PRIMARY KEY,
      phase TEXT,
      enrollment TEXT,
      start_date TEXT,
      primary_completion_date TEXT,
      completion_date TEXT,
      duration_years TEXT,
      molecule TEXT,
      endpoints TEXT,
      indication TEXT,
      dosage_strength TEXT,
      location_other TEXT,
      sponsor TEXT,
      biologic_type TEXT,
      age TEXT,
      pharm_class TEXT,
      trial_design TEXT,
      route_of_admin TEXT,
      technology TEXT,
      disease_condition TEXT,
      admin_type TEXT,
      primary_end_point TEXT,
      public_title TEXT,
      scientific_title TEXT,
      recruitment_status TEXT,
      blinding TEXT,
      randomization TEXT,
      gender_criteria TEXT,
      registry_url TEXT
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${fqDetail} (
      nct_id TEXT PRIMARY KEY,
      brief_summary TEXT,
      secondary_outcomes TEXT,
      outcome_timepoints TEXT,
      intervention_details TEXT,
      source_fields TEXT
    );
  `)

  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    await client.query(`TRUNCATE TABLE ${fqDetail}`)
    await client.query(`TRUNCATE TABLE ${fqMain}`)

    const mainCols = CTG_COUNTRY_DB_COLUMNS.join(", ")
    const mainPh = CTG_COUNTRY_DB_COLUMNS.map((_, i) => `$${i + 1}`).join(", ")
    const insertMain = `INSERT INTO ${fqMain} (${mainCols}) VALUES (${mainPh})`

    const detailCols = CTG_COUNTRY_DETAIL_COLUMNS.join(", ")
    const detailPh = CTG_COUNTRY_DETAIL_COLUMNS.map((_, i) => `$${i + 1}`).join(", ")
    const insertDetail = `INSERT INTO ${fqDetail} (${detailCols}) VALUES (${detailPh})`

    let inserted = 0
    for (const trial of trials) {
      const main = trialToCtgCountryListRow(trial)
      await client.query(insertMain, CTG_COUNTRY_DB_COLUMNS.map(c => main[c]))
      const detail = trialToCtgCountryDetailRow(trial)
      await client.query(insertDetail, CTG_COUNTRY_DETAIL_COLUMNS.map(c => detail[c]))
      inserted++
    }
    await client.query("COMMIT")

    const idxStmts = [
      `CREATE INDEX IF NOT EXISTS idx_${table}_phase ON ${fqMain} (phase)`,
      `CREATE INDEX IF NOT EXISTS idx_${table}_indication ON ${fqMain} (indication)`,
      `CREATE INDEX IF NOT EXISTS idx_${table}_trial_design ON ${fqMain} (trial_design)`,
      `CREATE INDEX IF NOT EXISTS idx_${table}_admin_type ON ${fqMain} (admin_type)`,
      `CREATE INDEX IF NOT EXISTS idx_${table}_recruitment ON ${fqMain} (recruitment_status)`,
      `CREATE INDEX IF NOT EXISTS idx_${table}_molecule ON ${fqMain} (molecule)`,
      `CREATE INDEX IF NOT EXISTS idx_${table}_enrollment ON ${fqMain} (enrollment)`,
      `CREATE INDEX IF NOT EXISTS idx_${table}_sponsor ON ${fqMain} (sponsor)`,
    ]
    for (const sql of idxStmts) await pool.query(sql)
    await pool.query(`VACUUM ANALYZE ${fqMain}`)

    console.log(
      `Inserted ${inserted} ${config.label} trials into ${schema}.${table} + ${detailTable}.`,
    )
  } catch (e) {
    await client.query("ROLLBACK")
    console.error("Upload failed:", e)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
