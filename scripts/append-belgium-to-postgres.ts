/**
 * Load Belgium cancer trials from the ANZCTR/ClinicalTrials.gov scrape Excel
 * into Postgres.
 *
 *   npm run data:sync-belgium
 *   npm run data:sync-belgium -- path/to/Belgium.xlsx
 */
import fs from "node:fs"
import path from "node:path"
import XLSX from "xlsx"
import {
  BELGIUM_DB_COLUMNS,
  BELGIUM_DB_TABLE_DEFAULT,
  BELGIUM_DETAIL_COLUMNS,
  mapBelgiumExcelRow,
  trialToBelgiumDetailRow,
  trialToBelgiumListRow,
} from "../lib/belgium-trial-map"
import {
  ensureSchema,
  getPool,
  getSchemaTableNames,
} from "../lib/postgres-client"

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

function loadTrialsFromBelgiumXlsx(xlsxPath: string) {
  const wb = XLSX.readFile(xlsxPath)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })
  const mapped = rows.map(mapBelgiumExcelRow).filter(t => t.nctId)
  console.log(`Belgium rows: ${rows.length} total → ${mapped.length} with NCT ID`)
  return mapped
}

async function main(): Promise<void> {
  const root = process.cwd()
  loadEnvFile(path.join(root, ".env.local"))
  loadEnvFile(path.join(root, ".env"))

  const xlsxPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(root, "Pol-xs", "ct-scraper", "output", "Belgium.xlsx")

  if (!fs.existsSync(xlsxPath)) {
    console.error("Excel file not found:", xlsxPath)
    process.exit(1)
  }

  const trials = loadTrialsFromBelgiumXlsx(xlsxPath)
  if (trials.length === 0) {
    console.error("No Belgium trials loaded from", xlsxPath)
    process.exit(1)
  }

  const table = process.env.POSTGRES_BELGIUM_TABLE?.trim() || BELGIUM_DB_TABLE_DEFAULT
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

    const mainCols = BELGIUM_DB_COLUMNS.join(", ")
    const mainPh = BELGIUM_DB_COLUMNS.map((_, i) => `$${i + 1}`).join(", ")
    const insertMain = `INSERT INTO ${fqMain} (${mainCols}) VALUES (${mainPh})`

    const detailCols = BELGIUM_DETAIL_COLUMNS.join(", ")
    const detailPh = BELGIUM_DETAIL_COLUMNS.map((_, i) => `$${i + 1}`).join(", ")
    const insertDetail = `INSERT INTO ${fqDetail} (${detailCols}) VALUES (${detailPh})`

    let inserted = 0
    for (const trial of trials) {
      const main = trialToBelgiumListRow(trial)
      await client.query(insertMain, BELGIUM_DB_COLUMNS.map(c => main[c]))
      const detail = trialToBelgiumDetailRow(trial)
      await client.query(insertDetail, BELGIUM_DETAIL_COLUMNS.map(c => detail[c]))
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

    console.log(`Inserted ${inserted} Belgium trials into ${schema}.${table} + ${detailTable}.`)
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
