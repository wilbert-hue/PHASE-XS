import "server-only"

import type { QueryResult } from "pg"
import type { Trial } from "@/app/dashboard/trial-types"
import {
  mapRowToTrialList,
  SELECT_TRIALS_LIST_SQL,
} from "@/lib/trials-db-shared"
import {
  getPool,
  getSchemaTableNames,
  msSince,
  errDetail,
  timeoutHint,
  redactedDbTarget,
  getConnectionString,
} from "@/lib/postgres-client"

export { mapRowToTrial, SELECT_TRIALS_FULL_SQL } from "@/lib/trials-db-shared"

const LOG = "[trials-db]"

function getSchemaTable(): { schema: string; table: string } {
  const table = (process.env.POSTGRES_TABLE?.trim() || "final_output_22").trim() || "final_output_22"
  return getSchemaTableNames(table)
}

export async function fetchTrialsFromPostgres(): Promise<Trial[]> {
  const overallStart = performance.now()

  let schema: string
  let table: string
  try {
    ;({ schema, table } = getSchemaTable())
  } catch (err) {
    console.error(LOG, "schema/table config error", {
      totalMs: msSince(overallStart),
      ...errDetail(err),
    })
    throw err
  }

  let pool: ReturnType<typeof getPool>
  try {
    pool = getPool()
  } catch (err) {
    console.error(LOG, "connection pool error", {
      schema,
      table,
      totalMs: msSince(overallStart),
      ...errDetail(err),
    })
    throw err
  }

  const q = `${SELECT_TRIALS_LIST_SQL} ${schema}.${table}`
  const queryStart = performance.now()
  let res: QueryResult<Record<string, unknown>>
  try {
    res = await pool.query(q)
  } catch (err) {
    const detail = errDetail(err)
    const hint = timeoutHint(err)
    const target = redactedDbTarget(getConnectionString())
    console.error(LOG, "SQL query failed", {
      target,
      schema,
      table,
      queryMs: msSince(queryStart),
      totalMs: msSince(overallStart),
      ...detail,
      ...(hint ? { hint } : {}),
    })
    throw err
  }
  const queryMs = msSince(queryStart)

  const mapStart = performance.now()
  try {
    const trials = res.rows.map((row) => mapRowToTrialList(row as Record<string, unknown>))
    const mapMs = msSince(mapStart)
    const totalMs = msSince(overallStart)
    console.info(LOG, "fetch ok", {
      schema,
      table,
      rows: trials.length,
      queryMs,
      mapMs,
      totalMs,
    })
    return trials
  } catch (err) {
    console.error(LOG, "row mapping failed", {
      schema,
      table,
      queryMs,
      mapMs: msSince(mapStart),
      totalMs: msSince(overallStart),
      rawRowCount: res.rows.length,
      ...errDetail(err),
    })
    throw err
  }
}
