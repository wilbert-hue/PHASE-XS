import "server-only"

import type { Trial } from "@/app/dashboard/trial-types"
import {
  UK_DB_TABLE_DEFAULT,
  isUkInterventionalStudyDesign,
  mapUkDbRow,
} from "@/lib/uk-trial-map"
import {
  errDetail,
  getConnectionString,
  getPool,
  getSchemaTableNames,
  msSince,
  redactedDbTarget,
  timeoutHint,
} from "@/lib/postgres-client"

const LOG = "[trials-db-uk]"

const SELECT_UK_LIST_COLUMNS = `
  isrctn_id,
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

export function getUkSchemaTable(): { schema: string; table: string } {
  return getSchemaTableNames(
    process.env.POSTGRES_UK_TABLE?.trim() || UK_DB_TABLE_DEFAULT,
  )
}

export async function fetchTrialsFromPostgresUk(): Promise<Trial[]> {
  const overallStart = performance.now()
  const { schema, table } = getUkSchemaTable()

  let pool
  try {
    pool = getPool()
  } catch (err) {
    console.error(LOG, "connection pool error", { schema, table, ...errDetail(err) })
    throw err
  }

  const fq = `"${schema}"."${table}"`
  const q = `SELECT ${SELECT_UK_LIST_COLUMNS} FROM ${fq}`
  const queryStart = performance.now()
  try {
    const res = await pool.query(q)
    const queryMs = msSince(queryStart)
    const trials = res.rows
      .map(row => mapUkDbRow(row as Record<string, unknown>))
      .filter(t => t.nctId && isUkInterventionalStudyDesign(t.adminType))
    console.info(LOG, "fetch ok", {
      schema,
      table,
      rows: trials.length,
      queryMs,
      totalMs: msSince(overallStart),
    })
    return trials
  } catch (err) {
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
