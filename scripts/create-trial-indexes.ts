/**
 * Index US + India trial tables and run VACUUM ANALYZE (planner + storage hygiene).
 *
 *   npm run data:create-indexes
 *
 * Requires POSTGRES_DSN or DATABASE_URL in .env.local
 */
import fs from "node:fs"
import path from "node:path"
import { ensureTrialIndexes } from "../lib/postgres-trial-indexes"
import { getConnectionString, getPool, redactedDbTarget } from "../lib/postgres-client"

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "")
  }
}

async function main(): Promise<void> {
  const root = process.cwd()
  loadEnvFile(path.join(root, ".env.local"))
  loadEnvFile(path.join(root, ".env"))

  const pool = getPool()
  const { us, ctri } = await ensureTrialIndexes(pool)
  await pool.end()

  console.log(
    `Trial indexes ready on ${redactedDbTarget(getConnectionString())}: ` +
      `${us} on final_output_22, ${ctri} on ctri_trials_v2 (VACUUM ANALYZE done).`,
  )
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
