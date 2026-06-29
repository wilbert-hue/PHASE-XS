/**
 * Load isrctn_uk_cancer_trials_complete.xlsx into Postgres list + detail tables.
 *
 *   npm run data:sync-uk
 */
import fs from "node:fs"
import path from "node:path"
import XLSX from "xlsx"
import {
  UK_DB_COLUMNS,
  UK_DB_TABLE_DEFAULT,
  UK_DETAIL_COLUMNS,
  isUkInterventionalStudyDesign,
  mapUkExcelRow,
  trialToUkDetailRow,
  trialToUkListRow,
} from "../lib/uk-trial-map"
import {
  ensureSchema,
  getConnectionString,
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

function loadTrialsFromUkXlsx(xlsxPath: string) {
  const wb = XLSX.readFile(xlsxPath)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })
  const mapped = rows.map(mapUkExcelRow).filter(t => t.nctId)
  const interventional = mapped.filter(t => isUkInterventionalStudyDesign(t.adminType))
  console.log(
    `UK rows: ${rows.length} total → ${mapped.length} with ISRCTN → ${interventional.length} interventional`,
  )
  return interventional
}

async function main(): Promise<void> {
  const root = process.cwd()
  loadEnvFile(path.join(root, ".env.local"))
  loadEnvFile(path.join(root, ".env"))

  const xlsxPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(root, "isrctn_uk_cancer_trials_complete.xlsx")

  const trials = loadTrialsFromUkXlsx(xlsxPath)
  if (trials.length === 0) {
    console.error("No UK trials loaded from", xlsxPath)
    process.exit(1)
  }

  const table = process.env.POSTGRES_UK_TABLE?.trim() || UK_DB_TABLE_DEFAULT
  const detailTable = `${table}_detail`
  const { schema } = getSchemaTableNames(table)
  const pool = getPool()

  await ensureSchema(pool, schema)

  const fqMain = fq(schema, table)
  const fqDetail = fq(schema, detailTable)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${fqMain} (
      isrctn_id TEXT PRIMARY KEY,
      phase TEXT,
      enrollment TEXT,
      start_date TEXT,
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
      isrctn_id TEXT PRIMARY KEY,
      brief_summary TEXT,
      secondary_outcomes TEXT,
      outcome_timepoints TEXT,
      intervention_details TEXT,
      source_fields TEXT
    );
  `)
  await pool.query(`ALTER TABLE ${fqDetail} ADD COLUMN IF NOT EXISTS source_fields TEXT`)

  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    await client.query(`TRUNCATE TABLE ${fqDetail}`)
    await client.query(`TRUNCATE TABLE ${fqMain}`)

    const mainCols = UK_DB_COLUMNS.join(", ")
    const mainPh = UK_DB_COLUMNS.map((_, i) => `$${i + 1}`).join(", ")
    const insertMain = `INSERT INTO ${fqMain} (${mainCols}) VALUES (${mainPh})`

    const detailCols = UK_DETAIL_COLUMNS.join(", ")
    const detailPh = UK_DETAIL_COLUMNS.map((_, i) => `$${i + 1}`).join(", ")
    const insertDetail = `INSERT INTO ${fqDetail} (${detailCols}) VALUES (${detailPh})`

    let inserted = 0
    for (const trial of trials) {
      const main = trialToUkListRow(trial)
      await client.query(insertMain, UK_DB_COLUMNS.map(c => main[c]))
      const detail = trialToUkDetailRow(trial)
      await client.query(insertDetail, UK_DETAIL_COLUMNS.map(c => detail[c]))
      inserted++
    }
    await client.query("COMMIT")
    const idxTable = fq(schema, table)
    const idxStmts = [
      `CREATE INDEX IF NOT EXISTS idx_${table}_phase ON ${idxTable} (phase)`,
      `CREATE INDEX IF NOT EXISTS idx_${table}_indication ON ${idxTable} (indication)`,
      `CREATE INDEX IF NOT EXISTS idx_${table}_trial_design ON ${idxTable} (trial_design)`,
      `CREATE INDEX IF NOT EXISTS idx_${table}_admin_type ON ${idxTable} (admin_type)`,
      `CREATE INDEX IF NOT EXISTS idx_${table}_recruitment ON ${idxTable} (recruitment_status)`,
      `CREATE INDEX IF NOT EXISTS idx_${table}_molecule ON ${idxTable} (molecule)`,
      `CREATE INDEX IF NOT EXISTS idx_${table}_enrollment ON ${idxTable} (enrollment)`,
    ]
    for (const sql of idxStmts) await pool.query(sql)
    await pool.query(`VACUUM ANALYZE ${idxTable}`)
    console.log(
      `Inserted ${inserted} UK trials into ${schema}.${table} + ${detailTable}.`,
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
