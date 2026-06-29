import type { Pool } from "pg"
import { getSchemaTableNames } from "@/lib/postgres-client"
import { CTRI_DB_TABLE_DEFAULT } from "@/lib/ctri-trial-map"
import { UK_DB_TABLE_DEFAULT } from "@/lib/uk-trial-map"

function fq(schema: string, table: string): string {
  const qs = `"${schema.replace(/"/g, '""')}"`
  const qt = `"${table.replace(/"/g, '""')}"`
  return `${qs}.${qt}`
}

function idxName(table: string, suffix: string): string {
  const base = table.replace(/[^A-Za-z0-9_]/g, "_").slice(0, 40)
  return `idx_${base}_${suffix}`.slice(0, 63)
}

/** B-tree indexes for dashboard facets + trial ID lookups (US table). */
export function usTrialIndexStatements(schema: string, table: string): string[] {
  const t = fq(schema, table)
  return [
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "nct_id")} ON ${t} ("NCT_ID")`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "phase")} ON ${t} ("Phase")`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "indication")} ON ${t} ("INDICATION")`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "technology")} ON ${t} ("Technology")`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "trial_design")} ON ${t} ("trial design")`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "route")} ON ${t} ("Route of administration")`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "admin")} ON ${t} ("Physician/Self Administered")`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "molecule")} ON ${t} ("Molecule Name")`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "enrollment")} ON ${t} ("Enrollment")`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "sponsor")} ON ${t} ("Sponsor")`,
  ]
}

/** B-tree indexes for India dashboard facets (ctri_trials_v2). */
export function ctriTrialIndexStatements(schema: string, table: string): string[] {
  const t = fq(schema, table)
  return [
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "phase")} ON ${t} (phase)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "indication")} ON ${t} (indication)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "technology")} ON ${t} (technology)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "trial_design")} ON ${t} (trial_design)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "admin_type")} ON ${t} (admin_type)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "recruitment")} ON ${t} (recruitment_status)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "molecule")} ON ${t} (molecule)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "enrollment")} ON ${t} (enrollment)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "sponsor")} ON ${t} (sponsor)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "disease")} ON ${t} (disease_condition)`,
  ]
}

/** B-tree indexes for UK ISRCTN dashboard facets. */
export function ukTrialIndexStatements(schema: string, table: string): string[] {
  const t = fq(schema, table)
  return [
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "phase")} ON ${t} (phase)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "indication")} ON ${t} (indication)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "trial_design")} ON ${t} (trial_design)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "admin_type")} ON ${t} (admin_type)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "recruitment")} ON ${t} (recruitment_status)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "molecule")} ON ${t} (molecule)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "enrollment")} ON ${t} (enrollment)`,
    `CREATE INDEX IF NOT EXISTS ${idxName(table, "sponsor")} ON ${t} (sponsor)`,
  ]
}

export type EnsureTrialIndexesOptions = {
  schema?: string
  usTable?: string
  ctriTable?: string
  ukTable?: string
  /** When false, only create indexes (skip VACUUM ANALYZE). */
  analyze?: boolean
}

/**
 * Create indexes on US + India trial tables and refresh planner stats.
 * Indexes speed facet-style filters; smaller pool (see postgres-client) cuts connection RAM.
 */
export async function ensureTrialIndexes(
  pool: Pool,
  opts: EnsureTrialIndexesOptions = {},
): Promise<{ us: number; ctri: number; uk: number }> {
  const schema =
    opts.schema?.trim() ||
    (process.env.POSTGRES_SCHEMA?.trim() || "phasexs").trim() ||
    "phasexs"
  const usTable =
    opts.usTable?.trim() ||
    (process.env.POSTGRES_TABLE?.trim() || "final_output_22").trim() ||
    "final_output_22"
  const ctriTable =
    opts.ctriTable?.trim() ||
    (process.env.POSTGRES_CTRI_TABLE?.trim() || CTRI_DB_TABLE_DEFAULT).trim() ||
    CTRI_DB_TABLE_DEFAULT
  const ukTable =
    opts.ukTable?.trim() ||
    (process.env.POSTGRES_UK_TABLE?.trim() || UK_DB_TABLE_DEFAULT).trim() ||
    UK_DB_TABLE_DEFAULT

  getSchemaTableNames(usTable, schema)
  getSchemaTableNames(ctriTable, schema)
  getSchemaTableNames(ukTable, schema)

  const usStmts = usTrialIndexStatements(schema, usTable)
  const ctriStmts = ctriTrialIndexStatements(schema, ctriTable)
  const ukStmts = ukTrialIndexStatements(schema, ukTable)

  for (const sql of usStmts) await pool.query(sql)
  for (const sql of ctriStmts) await pool.query(sql)
  for (const sql of ukStmts) await pool.query(sql)

  if (opts.analyze !== false) {
    await pool.query(`VACUUM ANALYZE ${fq(schema, usTable)}`)
    await pool.query(`VACUUM ANALYZE ${fq(schema, ctriTable)}`)
    await pool.query(`VACUUM ANALYZE ${fq(schema, ukTable)}`)
  }

  return { us: usStmts.length, ctri: ctriStmts.length, uk: ukStmts.length }
}
