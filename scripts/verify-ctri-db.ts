/**
 * Quick check that phasexs.ctri_trials_v2 matches trimmed CSV export.
 * npx tsx scripts/verify-ctri-db.ts
 */
import fs from "node:fs"
import path from "node:path"
import { getPool, getSchemaTableNames } from "../lib/postgres-client"
import { CTRI_DB_TABLE_DEFAULT } from "../lib/ctri-trial-map"

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "")
  }
}

async function main() {
  const root = process.cwd()
  loadEnvFile(path.join(root, ".env.local"))
  loadEnvFile(path.join(root, ".env"))

  const table = process.env.POSTGRES_CTRI_TABLE?.trim() || CTRI_DB_TABLE_DEFAULT
  const { schema } = getSchemaTableNames(table)
  const pool = getPool()
  const fq = `"${schema}"."${table}"`

  const count = await pool.query(`SELECT COUNT(*)::int AS n FROM ${fq}`)
  const rand = await pool.query(
    `SELECT COUNT(*)::int AS n FROM ${fq} WHERE COALESCE(TRIM(randomization), '') <> ''`,
  )
  const sample = await pool.query(
    `SELECT ctri_id, phase, sponsor, randomization FROM ${fq} ORDER BY ctri_id LIMIT 3`,
  )

  await pool.end()

  console.log("Table:", `${schema}.${table}`)
  console.log("Row count:", count.rows[0]?.n)
  console.log("Rows with randomization text (expect 0):", rand.rows[0]?.n)
  console.log("Sample rows:", sample.rows)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
