import "server-only"

import type { Trial } from "@/app/dashboard/trial-types"
import { SPAIN_DB_TABLE_DEFAULT, mapSpainDbRow } from "@/lib/spain-trial-map"
import {
  errDetail,
  getConnectionString,
  getPool,
  getSchemaTableNames,
  msSince,
  redactedDbTarget,
  timeoutHint,
} from "@/lib/postgres-client"

const LOG = "[trials-db-spain]"

const SELECT_SPAIN_LIST_COLUMNS = `
  ct_number,
  phase,
  enrollment,
  start_date,
  completion_date,
  duration_years,
  molecule,
  endpoints,
  indication,
  dosage_strength,
  location_other,
  sponsor,
  biologic_type,
  age,
  pharm_class,
  trial_design,
  route_of_admin,
  technology,
  disease_condition,
  admin_type,
  primary_end_point,
  public_title,
  scientific_title,
  recruitment_status,
  blinding,
  randomization,
  gender_criteria,
  registry_url
`

export function getSpainSchemaTable(): { schema: string; table: string } {
  return getSchemaTableNames(
    process.env.POSTGRES_SPAIN_TABLE?.trim() || SPAIN_DB_TABLE_DEFAULT,
  )
}

export async function fetchTrialsFromPostgresSpain(): Promise<Trial[]> {
  const overallStart = performance.now()
  const { schema, table } = getSpainSchemaTable()

  let pool
  try {
    pool = getPool()
  } catch (err) {
    console.error(LOG, "connection pool error", { schema, table, ...errDetail(err) })
    throw err
  }

  const fq = `"${schema}"."${table}"`
  const q = `SELECT ${SELECT_SPAIN_LIST_COLUMNS} FROM ${fq}`
  const queryStart = performance.now()
  try {
    const res = await pool.query(q)
    const queryMs = msSince(queryStart)
    const trials = res.rows
      .map(row => mapSpainDbRow(row as Record<string, unknown>))
      .filter(t => t.nctId)
    console.info(LOG, "fetch ok", {
      schema,
      table,
      rows: trials.length,
      queryMs,
      totalMs: msSince(overallStart),
    })
    return trials
  } catch (err) {
    // 42P01 = table does not exist — Spain data not yet synced; return empty gracefully
    const pgCode = err && typeof err === "object" && "code" in err ? String((err as { code?: string }).code) : ""
    if (pgCode === "42P01") {
      console.warn(LOG, "Spain table not found — run `npm run data:sync-spain` to load data", { schema, table })
      return []
    }
    const detail = errDetail(err)
    const hint = timeoutHint(err)
    console.error(LOG, "SQL query failed", {
      target: redactedDbTarget(getConnectionString()),
      schema,
      table,
      queryMs: msSince(queryStart),
      totalMs: msSince(overallStart),
      ...detail,
      ...(hint ? { hint } : {}),
    })
    throw err
  }
}
