/**
 * Load ctri_trials_v2.csv into Postgres list + detail tables.
 *
 *   npm run data:sync-ctri
 *
 * Requires POSTGRES_DSN or DATABASE_URL in .env.local
 */
import fs from "node:fs"
import path from "node:path"
import { loadTrialsFromCtriCsvFile } from "../lib/ctri-csv-load"
import {
  CTRI_DB_COLUMNS,
  CTRI_DB_TABLE_DEFAULT,
  CTRI_DETAIL_COLUMNS,
  trialToCtriDetailRow,
  trialToCtriListRow,
} from "../lib/ctri-trial-map"
import { ctriDetailTableName } from "../lib/trial-detail-tables"
import { ensureTrialIndexes } from "../lib/postgres-trial-indexes"
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

async function main(): Promise<void> {
  const root = process.cwd()
  loadEnvFile(path.join(root, ".env.local"))
  loadEnvFile(path.join(root, ".env"))

  const csvPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(root, "ctri_trials_v2.csv")

  const trials = loadTrialsFromCtriCsvFile(csvPath)
  if (trials.length === 0) {
    console.error("No CTRI trials loaded from", csvPath)
    process.exit(1)
  }

  const table = process.env.POSTGRES_CTRI_TABLE?.trim() || CTRI_DB_TABLE_DEFAULT
  const detailTable = ctriDetailTableName(table)
  const { schema } = getSchemaTableNames(table)
  const pool = getPool()

  await ensureSchema(pool, schema)

  const fqMain = fq(schema, table)
  const fqDetail = fq(schema, detailTable)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${fqMain} (
      ctri_id TEXT PRIMARY KEY,
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
      ctri_detail_url TEXT
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${fqDetail} (
      ctri_id TEXT PRIMARY KEY,
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

    const mainCols = CTRI_DB_COLUMNS.join(", ")
    const mainPh = CTRI_DB_COLUMNS.map((_, i) => `$${i + 1}`).join(", ")
    const insertMain = `INSERT INTO ${fqMain} (${mainCols}) VALUES (${mainPh})`

    const detailCols = CTRI_DETAIL_COLUMNS.join(", ")
    const detailPh = CTRI_DETAIL_COLUMNS.map((_, i) => `$${i + 1}`).join(", ")
    const insertDetail = `INSERT INTO ${fqDetail} (${detailCols}) VALUES (${detailPh})`

    let inserted = 0
    for (const trial of trials) {
      const main = trialToCtriListRow(trial)
      await client.query(insertMain, CTRI_DB_COLUMNS.map(c => main[c]))
      const detail = trialToCtriDetailRow(trial)
      await client.query(insertDetail, CTRI_DETAIL_COLUMNS.map(c => detail[c]))
      inserted++
    }
    await client.query("COMMIT")
    await ensureTrialIndexes(pool, { schema, ctriTable: table, analyze: true })
    console.log(
      `Inserted ${inserted} India trials into ${schema}.${table} + ${detailTable} (${redactedTarget()}).`,
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

function redactedTarget(): string {
  try {
    const u = new URL(
      getConnectionString().includes("://")
        ? getConnectionString()
        : `postgres://${getConnectionString()}`,
    )
    return `${u.hostname}:${u.port || "5432"}`
  } catch {
    return "postgres"
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
