import fs from "node:fs"
import path from "node:path"
import { Pool, type QueryResult } from "pg"
import type { Trial } from "@/app/dashboard/trial-types"

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/
const LOG = "[trials-db]"

function msSince(start: number): number {
  return Math.round((performance.now() - start) * 100) / 100
}

function errDetail(err: unknown): { message: string; name?: string } {
  if (err instanceof Error) return { message: err.message, name: err.name }
  return { message: String(err) }
}

function needsSslConnection(connectionString: string): boolean {
  return (
    /aivencloud\.com/i.test(connectionString) ||
    /[?&]sslmode=(require|verify-full|verify-ca)/i.test(connectionString)
  )
}

/**
 * Aiven (and some providers) chains to a CA Node does not ship with.
 * - Prefer `POSTGRES_SSL_CA` = path to Aiven's CA PEM (Aiven console → service → CA cert).
 * - Without CA, we use `rejectUnauthorized: false` so TLS still encrypts but does not verify the chain.
 */
function getSslOptions(connectionString: string):
  | { rejectUnauthorized: boolean; ca?: string }
  | undefined {
  if (!needsSslConnection(connectionString)) return undefined

  const caPath = process.env.POSTGRES_SSL_CA?.trim()
  if (caPath) {
    const resolved = path.isAbsolute(caPath) ? caPath : path.join(process.cwd(), caPath)
    try {
      const ca = fs.readFileSync(resolved, "utf8")
      return { ca, rejectUnauthorized: true }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      throw new Error(`POSTGRES_SSL_CA not readable (${resolved}): ${msg}`)
    }
  }

  return { rejectUnauthorized: false }
}

function getConnectionString(): string {
  const s =
    process.env.POSTGRES_DSN?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    ""
  if (!s) {
    throw new Error("Set POSTGRES_DSN or DATABASE_URL for dashboard database access.")
  }
  return s
}

function getSchemaTable(): { schema: string; table: string } {
  const schema = (process.env.POSTGRES_SCHEMA?.trim() || "phasexs").trim() || "phasexs"
  const table = (process.env.POSTGRES_TABLE?.trim() || "final_output_22").trim() || "final_output_22"
  if (!IDENT.test(schema)) throw new Error("Invalid POSTGRES_SCHEMA")
  if (!IDENT.test(table)) throw new Error("Invalid POSTGRES_TABLE")
  return { schema, table }
}

declare global {
  var __phaseXsPgPool: Pool | undefined
}

function getPool(): Pool {
  const connectionString = getConnectionString()
  const ssl = getSslOptions(connectionString)

  if (!globalThis.__phaseXsPgPool) {
    globalThis.__phaseXsPgPool = new Pool({
      connectionString,
      max: 8,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 20_000,
      ...(ssl ? { ssl } : {}),
    })
  }
  return globalThis.__phaseXsPgPool
}

function str(v: unknown): string {
  if (v == null) return ""
  const s = String(v).trim()
  return s
}

function num(v: unknown): number {
  if (v == null || v === "") return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function numOrNull(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function intOrNullFromText(v: unknown): number | null {
  if (v == null || v === "") return null
  const s = String(v).trim()
  const m = s.match(/-?\d+/)
  if (!m) return null
  const n = parseInt(m[0], 10)
  return Number.isFinite(n) ? n : null
}

/** Maps one row from `phasexs.final_output_22` (SQLAlchemy / pandas column names). */
export function mapRowToTrial(row: Record<string, unknown>): Trial {
  const pharm =
    str(row["Pharmalogical Class"]) || str(row["Pharmacological class"])

  return {
    nctId: str(row["NCT_ID"]),
    phase: str(row["Phase"]),
    enrollment: Math.round(num(row["Enrollment"])),
    startDate: str(row["Study_Start_Date"]),
    primaryCompletionDate: str(row["Primary_Completion_Date"]),
    completionDate: str(row["Study_Completion_Date"]),
    durationYears: num(row["Duration_Year"]),
    arms: Math.round(num(row["Participant_Groups_Arms"])),
    estLaunchDate: intOrNullFromText(row["Est. Launch date"]),
    dosingFrequency: str(row["Dosing_Frequency"]),
    molecule: str(row["Molecule Name"]),
    approvedBiologics: str(row["Approved Biologics"]),
    reimbursement: str(row["Reimbursement"]) || undefined,
    numTrials: Math.round(num(row["No. of trials"])),
    atcCode: str(row["ATC Code"]),
    endpoints: str(row["End point parameter"]),
    adherenceRate: numOrNull(row["Adherence rate"]),
    drugBrandSwitch: str(row["Drug/Brand switch"]),
    indication: str(row["INDICATION"]),
    incidence2025: numOrNull(row["Estimated incidence for 2025"]),
    approvalYear: str(row["Approval Year"]),
    drugPrice: str(row["Drug Price (drugs.com)"]),
    drugPriceUrl: str(row["Price Source URL"]),
    dosageStrength: str(row["Dosage/Strength"]),
    adverseEffect: str(row["Adverse Effect"]),
    locationOther: str(row["Location Other Than U.S."]),
    sponsor: str(row["Sponsor"]),
    biologicType: str(row["Biologics/Biosimilar"]),
    age: str(row["Age"]),
    pharmClass: pharm,
    trialDesign: str(row["trial design"]),
    routeOfAdmin: str(row["Route of administration"]),
    technology: str(row["Technology"]),
    diseaseCondition: str(row["Disease Condition"]),
    adminType: str(row["Physician/Self Administered"]),
    primaryEndPoint: str(row["Primary End Point"]),
    marketForecast2023: str(row["MARKET FORECAST 2023 (US$ Mn)"]),
    marketForecast2024: str(row["MARKET FORECAST 2024 (US$ Mn)"]),
    marketForecast2025: str(row["MARKET FORECAST 2025 (US$ Mn)"]),
    marketForecast2026: str(row["MARKET FORECAST 2026 (US$ Mn)"]),
    marketForecast2027: str(row["MARKET FORECAST 2027 (US$ Mn )"]),
  }
}

const SELECT_TRIALS_SQL = `
  SELECT
    "NCT_ID",
    "Phase",
    "Enrollment",
    "Study_Start_Date",
    "Primary_Completion_Date",
    "Study_Completion_Date",
    "Duration_Year",
    "Participant_Groups_Arms",
    "Est. Launch date",
    "Dosing_Frequency",
    "Molecule Name",
    "Approved Biologics",
    "Reimbursement",
    "No. of trials",
    "ATC Code",
    "End point parameter",
    "Adherence rate",
    "Drug/Brand switch",
    "INDICATION",
    "Estimated incidence for 2025",
    "Approval Year",
    "Drug Price (drugs.com)",
    "Price Source URL",
    "Dosage/Strength",
    "Adverse Effect",
    "Location Other Than U.S.",
    "Sponsor",
    "Biologics/Biosimilar",
    "Age",
    "Pharmalogical Class",
    "Pharmacological class",
    "trial design",
    "Route of administration",
    "Technology",
    "Disease Condition",
    "Physician/Self Administered",
    "Primary End Point",
    "MARKET FORECAST 2023 (US$ Mn)",
    "MARKET FORECAST 2024 (US$ Mn)",
    "MARKET FORECAST 2025 (US$ Mn)",
    "MARKET FORECAST 2026 (US$ Mn)",
    "MARKET FORECAST 2027 (US$ Mn )"
  FROM`

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

  let pool: Pool
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

  const q = `${SELECT_TRIALS_SQL} ${schema}.${table}`
  const queryStart = performance.now()
  let res: QueryResult<Record<string, unknown>>
  try {
    res = await pool.query(q)
  } catch (err) {
    console.error(LOG, "SQL query failed", {
      schema,
      table,
      queryMs: msSince(queryStart),
      totalMs: msSince(overallStart),
      ...errDetail(err),
    })
    throw err
  }
  const queryMs = msSince(queryStart)

  const mapStart = performance.now()
  try {
    const trials = res.rows.map((row) => mapRowToTrial(row as Record<string, unknown>))
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
