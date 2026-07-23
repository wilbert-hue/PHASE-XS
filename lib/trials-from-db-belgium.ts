import "server-only"

import type { Trial } from "@/app/dashboard/trial-types"
import { BELGIUM_DB_TABLE_DEFAULT, mapBelgiumDbRow } from "@/lib/belgium-trial-map"
import {
  errDetail,
  getConnectionString,
  getPool,
  getSchemaTableNames,
  msSince,
  redactedDbTarget,
  timeoutHint,
} from "@/lib/postgres-client"

const LOG = "[trials-db-belgium]"

const SELECT_BELGIUM_LIST_COLUMNS = `
  nct_id,
  phase,
  enrollment,
  start_date,
  primary_completion_date,
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

export function getBelgiumSchemaTable(): { schema: string; table: string } {
  return getSchemaTableNames(
    process.env.POSTGRES_BELGIUM_TABLE?.trim() || BELGIUM_DB_TABLE_DEFAULT,
  )
}

export async function fetchTrialsFromPostgresBelgium(): Promise<Trial[]> {
  const overallStart = performance.now()
  const { schema, table } = getBelgiumSchemaTable()

  let pool
  try {
    pool = getPool()
  } catch (err) {
    console.error(LOG, "connection pool error", { schema, table, ...errDetail(err) })
    throw err
  }

  const fq = `"${schema}"."${table}"`
  const q = `SELECT ${SELECT_BELGIUM_LIST_COLUMNS} FROM ${fq}`
  const queryStart = performance.now()
  try {
    const res = await pool.query(q)
    const queryMs = msSince(queryStart)
    const trials = res.rows
      .map(row => mapBelgiumDbRow(row as Record<string, unknown>))
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
    // 42P01 = table does not exist — Belgium data not yet synced
    const pgCode = err && typeof err === "object" && "code" in err ? String((err as { code?: string }).code) : ""
    if (pgCode === "42P01") {
      console.warn(LOG, "Belgium table not found — run `npm run data:sync-belgium` to load data", { schema, table })
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
