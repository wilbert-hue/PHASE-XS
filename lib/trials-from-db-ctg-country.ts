import "server-only"

import type { Trial } from "@/app/dashboard/trial-types"
import { CTG_COUNTRY_CONFIGS, CTG_COUNTRY_TABLE_DEFAULT, mapCtgCountryDbRow } from "@/lib/ctg-country-trial-map"
import {
  errDetail,
  getConnectionString,
  getPool,
  getSchemaTableNames,
  msSince,
  redactedDbTarget,
  timeoutHint,
} from "@/lib/postgres-client"

const LOG = "[trials-db-ctg-country]"

const SELECT_CTG_COUNTRY_LIST_COLUMNS = `
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

export function getCtgCountrySchemaTable(regionId: string): { schema: string; table: string } {
  const envVar = `POSTGRES_${regionId.toUpperCase()}_TABLE`
  const table = (process.env[envVar]?.trim()) || CTG_COUNTRY_TABLE_DEFAULT(regionId)
  return getSchemaTableNames(table)
}

export async function fetchTrialsFromPostgresCtgCountry(regionId: string): Promise<Trial[]> {
  const overallStart = performance.now()
  const config = CTG_COUNTRY_CONFIGS[regionId]
  if (!config) {
    console.warn(LOG, `Unknown CTG country region: ${regionId}`)
    return []
  }

  const { schema, table } = getCtgCountrySchemaTable(regionId)

  let pool
  try {
    pool = getPool()
  } catch (err) {
    console.error(LOG, "connection pool error", { regionId, schema, table, ...errDetail(err) })
    throw err
  }

  const fq = `"${schema}"."${table}"`
  const q = `SELECT ${SELECT_CTG_COUNTRY_LIST_COLUMNS} FROM ${fq}`
  const queryStart = performance.now()
  try {
    const res = await pool.query(q)
    const queryMs = msSince(queryStart)
    const trials = res.rows
      .map(row => mapCtgCountryDbRow(row as Record<string, unknown>))
      .filter(t => t.nctId)
    console.info(LOG, "fetch ok", {
      regionId,
      schema,
      table,
      rows: trials.length,
      queryMs,
      totalMs: msSince(overallStart),
    })
    return trials
  } catch (err) {
    const pgCode =
      err && typeof err === "object" && "code" in err
        ? String((err as { code?: string }).code)
        : ""
    if (pgCode === "42P01") {
      console.warn(
        LOG,
        `${config.label} table not found — run \`npm run data:sync-${regionId}\` to load data`,
        { schema, table },
      )
      return []
    }
    const detail = errDetail(err)
    const hint = timeoutHint(err)
    console.error(LOG, "SQL query failed", {
      target: redactedDbTarget(getConnectionString()),
      regionId,
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
