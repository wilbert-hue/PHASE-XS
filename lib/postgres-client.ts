import fs from "node:fs"
import path from "node:path"
import { Pool } from "pg"

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/

export function msSince(start: number): number {
  return Math.round((performance.now() - start) * 100) / 100
}

export function errDetail(err: unknown): Record<string, string | number | undefined> {
  if (err instanceof Error) {
    const e = err as Error & { code?: string; errno?: number; syscall?: string }
    return {
      message: err.message,
      name: err.name,
      code: e.code,
      errno: e.errno,
      syscall: e.syscall,
    }
  }
  return { message: String(err) }
}

export function redactedDbTarget(connectionString: string): string {
  try {
    const u = new URL(
      connectionString.includes("://") ? connectionString : `postgres://${connectionString}`,
    )
    return `${u.hostname}:${u.port || "5432"}`
  } catch {
    return "(unparseable URI)"
  }
}

export function timeoutHint(err: unknown): string | undefined {
  const msg = err instanceof Error ? err.message : String(err)
  if (/timeout|ETIMEDOUT|ECONNREFUSED|ENOTFOUND|Connection terminated/i.test(msg)) {
    return (
      "Network blocked or unreachable from this machine. On Aiven: open your PostgreSQL service → " +
        "Settings → IP filter / trusted addresses and add this machine's public IP."
    )
  }
  return undefined
}

function needsSslConnection(connectionString: string): boolean {
  return (
    /aivencloud\.com/i.test(connectionString) ||
    /[?&]sslmode=(require|verify-full|verify-ca)/i.test(connectionString)
  )
}

function getSslOptions(connectionString: string):
  | { rejectUnauthorized: boolean; ca?: string }
  | undefined {
  if (!needsSslConnection(connectionString)) return undefined

  const caPath = process.env.POSTGRES_SSL_CA?.trim()
  if (caPath) {
    const resolved = path.isAbsolute(caPath) ? caPath : path.join(process.cwd(), caPath)
    const ca = fs.readFileSync(resolved, "utf8")
    return { ca, rejectUnauthorized: true }
  }

  return { rejectUnauthorized: false }
}

export function getConnectionString(): string {
  const s =
    process.env.POSTGRES_DSN?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    ""
  if (!s) {
    throw new Error("Set POSTGRES_DSN or DATABASE_URL for database access.")
  }
  return s
}

export function getSchemaTableNames(
  table: string,
  schema = (process.env.POSTGRES_SCHEMA?.trim() || "phasexs").trim() || "phasexs",
): { schema: string; table: string } {
  if (!IDENT.test(schema)) throw new Error("Invalid POSTGRES_SCHEMA")
  if (!IDENT.test(table)) throw new Error("Invalid table name")
  return { schema, table }
}

declare global {
  // eslint-disable-next-line no-var
  var __phaseXsPgPool: Pool | undefined
}

function connectionTimeoutMs(): number {
  const raw = process.env.POSTGRES_CONNECTION_TIMEOUT_MS?.trim()
  const n = raw ? Number(raw) : NaN
  if (Number.isFinite(n) && n >= 3_000 && n <= 120_000) return Math.floor(n)
  return 30_000
}

/** Max pooled connections (each uses RAM on small Aiven plans). Default 3. */
function poolMaxConnections(): number {
  const raw = process.env.POSTGRES_POOL_MAX?.trim()
  const n = raw ? Number(raw) : NaN
  if (Number.isFinite(n) && n >= 1 && n <= 10) return Math.floor(n)
  return 3
}

export function getPool(): Pool {
  const connectionString = getConnectionString()
  const ssl = getSslOptions(connectionString)

  if (!globalThis.__phaseXsPgPool) {
    globalThis.__phaseXsPgPool = new Pool({
      connectionString,
      max: poolMaxConnections(),
      idleTimeoutMillis: 15_000,
      connectionTimeoutMillis: connectionTimeoutMs(),
      keepAlive: true,
      ...(ssl ? { ssl } : {}),
    })
  }
  return globalThis.__phaseXsPgPool
}

export async function ensureSchema(pool: Pool, schema: string): Promise<void> {
  if (!IDENT.test(schema)) throw new Error("Invalid schema name")
  const quoted = `"${schema.replace(/"/g, '""')}"`
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${quoted}`)
}
