import "server-only"

import type { Trial } from "@/app/dashboard/trial-types"
import type { DashboardRegion } from "@/lib/dashboard-region"
import { normalizeCtriId } from "@/lib/ctri-id"
import {
  CTRI_DB_TABLE_DEFAULT,
  applyCtriDetailToTrial,
  mapCtriDbRow,
  mapCtriDetailRow,
} from "@/lib/ctri-trial-map"
import {
  UK_DB_TABLE_DEFAULT,
  applyUkDetailToTrial,
  mapUkDbRow,
  mapUkDetailRow,
} from "@/lib/uk-trial-map"
import { ctriDetailTableName, ukDetailTableName, usDetailTableName, spainDetailTableName, belgiumDetailTableName } from "@/lib/trial-detail-tables"
import {
  SPAIN_DB_TABLE_DEFAULT,
  applySpainDetailToTrial,
  mapSpainDbRow,
  mapSpainDetailRow,
} from "@/lib/spain-trial-map"
import {
  BELGIUM_DB_TABLE_DEFAULT,
  applyBelgiumDetailToTrial,
  mapBelgiumDbRow,
  mapBelgiumDetailRow,
} from "@/lib/belgium-trial-map"
import { applyUsDetailToTrial, mapUsDetailRow } from "@/lib/us-trial-detail-map"
import { US_EXCEL_COLUMNS, pickSourceFields } from "@/lib/excel-column-order"
import { hydrateCtriSourceFields, hydrateUsSourceFields } from "@/lib/trial-source-hydrate"
import { mapRowToTrial } from "@/lib/trials-db-shared"
import { getPool, getSchemaTableNames, msSince } from "@/lib/postgres-client"

const LOG = "[trial-detail-db]"

export async function fetchCtriTrialDetail(ctriId: string): Promise<Trial | null> {
  const id = normalizeCtriId(ctriId)
  if (!id) return null

  const mainTable = process.env.POSTGRES_CTRI_TABLE?.trim() || CTRI_DB_TABLE_DEFAULT
  const detailTable = ctriDetailTableName(mainTable)
  const { schema } = getSchemaTableNames(mainTable)
  const pool = getPool()
  const fqMain = `"${schema}"."${mainTable}"`
  const fqDetail = `"${schema}"."${detailTable}"`

  const mainRes = await pool.query(`SELECT * FROM ${fqMain} WHERE ctri_id = $1 LIMIT 1`, [id])
  if (mainRes.rows.length === 0) return null

  let trial = mapCtriDbRow(mainRes.rows[0] as Record<string, unknown>)
  try {
    const detailRes = await pool.query(`SELECT * FROM ${fqDetail} WHERE ctri_id = $1 LIMIT 1`, [id])
    if (detailRes.rows[0]) {
      trial = applyCtriDetailToTrial(trial, mapCtriDetailRow(detailRes.rows[0] as Record<string, unknown>))
    }
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String((err as { code?: string }).code) : ""
    if (code !== "42P01") throw err
    console.warn(LOG, "ctri detail table missing; returning list row only", { detailTable })
  }
  const sourceFields = trial.sourceFields ?? {}
  const withSources = { ...trial, sourceFields }
  const hydrated = hydrateCtriSourceFields(withSources)
  return { ...withSources, sourceFields: { ...sourceFields, ...hydrated } }
}

export async function fetchUsTrialDetail(nctId: string): Promise<Trial | null> {
  const id = nctId.trim()
  if (!id) return null

  const mainTable = (process.env.POSTGRES_TABLE?.trim() || "final_output_22").trim() || "final_output_22"
  const detailTable = usDetailTableName(mainTable)
  const { schema } = getSchemaTableNames(mainTable)
  const pool = getPool()
  const fqMain = `"${schema}"."${mainTable}"`
  const fqDetail = `"${schema}"."${detailTable}"`

  const mainRes = await pool.query(`SELECT * FROM ${fqMain} WHERE "NCT_ID" = $1 LIMIT 1`, [id])
  if (mainRes.rows.length === 0) return null

  const mainRow = mainRes.rows[0] as Record<string, unknown>
  let trial = mapRowToTrial(mainRow)
  trial = {
    ...trial,
    sourceFields: pickSourceFields(mainRow, US_EXCEL_COLUMNS),
  }
  try {
    const detailRes = await pool.query(`SELECT * FROM ${fqDetail} WHERE nct_id = $1 LIMIT 1`, [id])
    if (detailRes.rows[0]) {
      trial = applyUsDetailToTrial(trial, mapUsDetailRow(detailRes.rows[0] as Record<string, unknown>))
    }
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String((err as { code?: string }).code) : ""
    if (code !== "42P01") throw err
    console.warn(LOG, "US detail table missing; returning list row only", { detailTable })
  }
  return { ...trial, sourceFields: hydrateUsSourceFields(trial) }
}

export async function fetchUkTrialDetail(isrctnId: string): Promise<Trial | null> {
  const id = isrctnId.trim()
  if (!id) return null

  const mainTable = process.env.POSTGRES_UK_TABLE?.trim() || UK_DB_TABLE_DEFAULT
  const detailTable = ukDetailTableName(mainTable)
  const { schema } = getSchemaTableNames(mainTable)
  const pool = getPool()
  const fqMain = `"${schema}"."${mainTable}"`
  const fqDetail = `"${schema}"."${detailTable}"`

  const mainRes = await pool.query(`SELECT * FROM ${fqMain} WHERE isrctn_id = $1 LIMIT 1`, [id])
  if (mainRes.rows.length === 0) return null

  let trial = mapUkDbRow(mainRes.rows[0] as Record<string, unknown>)
  try {
    const detailRes = await pool.query(`SELECT * FROM ${fqDetail} WHERE isrctn_id = $1 LIMIT 1`, [id])
    if (detailRes.rows[0]) {
      trial = applyUkDetailToTrial(trial, mapUkDetailRow(detailRes.rows[0] as Record<string, unknown>))
    }
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String((err as { code?: string }).code) : ""
    if (code !== "42P01") throw err
    console.warn(LOG, "UK detail table missing; returning list row only", { detailTable })
  }
  return trial
}

export async function fetchSpainTrialDetail(ctNumber: string): Promise<Trial | null> {
  const id = ctNumber.trim()
  if (!id) return null

  const mainTable = process.env.POSTGRES_SPAIN_TABLE?.trim() || SPAIN_DB_TABLE_DEFAULT
  const detailTable = spainDetailTableName(mainTable)
  const { schema } = getSchemaTableNames(mainTable)
  const pool = getPool()
  const fqMain = `"${schema}"."${mainTable}"`
  const fqDetail = `"${schema}"."${detailTable}"`

  const mainRes = await pool.query(`SELECT * FROM ${fqMain} WHERE ct_number = $1 LIMIT 1`, [id])
  if (mainRes.rows.length === 0) return null

  let trial = mapSpainDbRow(mainRes.rows[0] as Record<string, unknown>)
  try {
    const detailRes = await pool.query(`SELECT * FROM ${fqDetail} WHERE ct_number = $1 LIMIT 1`, [id])
    if (detailRes.rows[0]) {
      trial = applySpainDetailToTrial(trial, mapSpainDetailRow(detailRes.rows[0] as Record<string, unknown>))
    }
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String((err as { code?: string }).code) : ""
    if (code !== "42P01") throw err
    console.warn(LOG, "Spain detail table missing; returning list row only", { detailTable })
  }
  return trial
}

export async function fetchBelgiumTrialDetail(nctId: string): Promise<Trial | null> {
  const id = nctId.trim()
  if (!id) return null

  const mainTable = process.env.POSTGRES_BELGIUM_TABLE?.trim() || BELGIUM_DB_TABLE_DEFAULT
  const detailTable = belgiumDetailTableName(mainTable)
  const { schema } = getSchemaTableNames(mainTable)
  const pool = getPool()
  const fqMain = `"${schema}"."${mainTable}"`
  const fqDetail = `"${schema}"."${detailTable}"`

  const mainRes = await pool.query(`SELECT * FROM ${fqMain} WHERE nct_id = $1 LIMIT 1`, [id])
  if (mainRes.rows.length === 0) return null

  let trial = mapBelgiumDbRow(mainRes.rows[0] as Record<string, unknown>)
  try {
    const detailRes = await pool.query(`SELECT * FROM ${fqDetail} WHERE nct_id = $1 LIMIT 1`, [id])
    if (detailRes.rows[0]) {
      trial = applyBelgiumDetailToTrial(trial, mapBelgiumDetailRow(detailRes.rows[0] as Record<string, unknown>))
    }
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String((err as { code?: string }).code) : ""
    if (code !== "42P01") throw err
    console.warn(LOG, "Belgium detail table missing; returning list row only", { detailTable })
  }
  return trial
}

export async function fetchTrialDetailForRegion(
  region: DashboardRegion,
  trialId: string,
): Promise<Trial | null> {
  const start = performance.now()
  const trial =
    region === "in"
      ? await fetchCtriTrialDetail(trialId)
      : region === "uk"
        ? await fetchUkTrialDetail(trialId)
        : region === "es"
          ? await fetchSpainTrialDetail(trialId)
          : region === "be"
            ? await fetchBelgiumTrialDetail(trialId)
            : await fetchUsTrialDetail(trialId)
  console.info(LOG, "fetch", { region, trialId, found: !!trial, ms: msSince(start) })
  return trial
}
