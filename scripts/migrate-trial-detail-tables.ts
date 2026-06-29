/**
 * Backfill `*_detail` tables from existing main tables (no CSV required).
 * India: also drops legacy heavy columns from main when present.
 *
 *   npm run data:migrate-detail
 *   npm run data:sync-ctri          # preferred full India rebuild after deploy
 */
import fs from "node:fs"
import path from "node:path"
import { CTRI_DB_TABLE_DEFAULT } from "../lib/ctri-trial-map"
import { ctriDetailTableName, usDetailTableName } from "../lib/trial-detail-tables"
import { SELECT_TRIALS_FULL_SQL, mapRowToTrial } from "../lib/trials-db-shared"
import { trialToUsDetailRow, US_DETAIL_COLUMNS } from "../lib/us-trial-detail-map"
import { getPool, getSchemaTableNames } from "../lib/postgres-client"

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "")
  }
}

function fq(schema: string, table: string): string {
  return `"${schema.replace(/"/g, '""')}"."${table.replace(/"/g, '""')}"`
}

async function columnExists(
  pool: Awaited<ReturnType<typeof getPool>>,
  schema: string,
  table: string,
  column: string,
): Promise<boolean> {
  const res = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
    [schema, table, column],
  )
  return res.rowCount !== null && res.rowCount > 0
}

async function migrateUs(pool: Awaited<ReturnType<typeof getPool>>, schema: string, mainTable: string) {
  const detailTable = usDetailTableName(mainTable)
  const fqMain = fq(schema, mainTable)
  const fqDetail = fq(schema, detailTable)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${fqDetail} (
      nct_id TEXT PRIMARY KEY,
      adverse_effect TEXT,
      drug_brand_switch TEXT,
      approved_biologics TEXT,
      dosage_strength TEXT,
      location_other TEXT,
      endpoints TEXT,
      market_forecast_2023 TEXT,
      market_forecast_2024 TEXT,
      market_forecast_2025 TEXT,
      market_forecast_2026 TEXT,
      market_forecast_2027 TEXT
    );
  `)

  await pool.query(`TRUNCATE TABLE ${fqDetail}`)
  const res = await pool.query(`${SELECT_TRIALS_FULL_SQL} ${fqMain}`)
  const cols = US_DETAIL_COLUMNS.join(", ")
  const ph = US_DETAIL_COLUMNS.map((_, i) => `$${i + 1}`).join(", ")
  const insert = `INSERT INTO ${fqDetail} (${cols}) VALUES (${ph})`
  const seen = new Set<string>()
  let inserted = 0
  for (const row of res.rows) {
    const trial = mapRowToTrial(row as Record<string, unknown>)
    if (!trial.nctId || seen.has(trial.nctId)) continue
    seen.add(trial.nctId)
    const detail = trialToUsDetailRow(trial)
    await pool.query(
      `${insert} ON CONFLICT (nct_id) DO UPDATE SET adverse_effect = EXCLUDED.adverse_effect`,
      US_DETAIL_COLUMNS.map(c => detail[c]),
    )
    inserted++
  }
  console.log(`US detail: ${inserted} rows → ${schema}.${detailTable} (${res.rows.length} source rows)`)
}

async function migrateCtri(pool: Awaited<ReturnType<typeof getPool>>, schema: string, mainTable: string) {
  const detailTable = ctriDetailTableName(mainTable)
  const fqMain = fq(schema, mainTable)
  const fqDetail = fq(schema, detailTable)

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

  const hasBrief = await columnExists(pool, schema, mainTable, "brief_summary")
  await pool.query(`TRUNCATE TABLE ${fqDetail}`)

  if (hasBrief) {
    await pool.query(`
      INSERT INTO ${fqDetail} (ctri_id, brief_summary, secondary_outcomes, outcome_timepoints, intervention_details)
      SELECT ctri_id, brief_summary, secondary_outcomes, outcome_timepoints, dosage_strength
      FROM ${fqMain}
    `)
    const res = await pool.query(`SELECT COUNT(*)::int AS n FROM ${fqDetail}`)
    console.log(`India detail backfill from main: ${res.rows[0]?.n ?? 0} rows`)

    for (const col of ["brief_summary", "secondary_outcomes", "outcome_timepoints"]) {
      await pool.query(`ALTER TABLE ${fqMain} DROP COLUMN IF EXISTS ${col}`)
    }
    console.log("Dropped legacy heavy columns from", `${schema}.${mainTable}`)
  } else {
    console.log("India main already slim; run npm run data:sync-ctri for full rebuild.")
  }
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env.local"))
  loadEnvFile(path.join(process.cwd(), ".env"))

  const usTable = (process.env.POSTGRES_TABLE?.trim() || "final_output_22").trim() || "final_output_22"
  const ctriTable = process.env.POSTGRES_CTRI_TABLE?.trim() || CTRI_DB_TABLE_DEFAULT
  const { schema: usSchema } = getSchemaTableNames(usTable)
  const { schema: ctriSchema } = getSchemaTableNames(ctriTable)

  const pool = getPool()
  await migrateUs(pool, usSchema, usTable)
  await migrateCtri(pool, ctriSchema, ctriTable)
  await pool.query(`VACUUM ANALYZE ${fq(usSchema, usTable)}`)
  await pool.query(`VACUUM ANALYZE ${fq(ctriSchema, ctriTable)}`)
  await pool.query(`VACUUM ANALYZE ${fq(usSchema, usDetailTableName(usTable))}`)
  await pool.query(`VACUUM ANALYZE ${fq(ctriSchema, ctriDetailTableName(ctriTable))}`)
  await pool.end()
  console.log("Detail migration complete.")
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
