import type { Trial } from "@/app/dashboard/trial-types"
import trialsJson from "@/app/data/trials.json"
import { fetchTrialsFromPostgres } from "@/lib/trials-from-db"

let marketedPgFallbackLogged = false

/**
 * Trials for public landing stats: Postgres when configured, otherwise bundled JSON.
 */
export async function loadTrialsForMarketing(): Promise<Trial[]> {
  const dsn = process.env.POSTGRES_DSN?.trim() || process.env.DATABASE_URL?.trim()
  if (dsn) {
    try {
      return await fetchTrialsFromPostgres()
    } catch (e) {
      if (!marketedPgFallbackLogged) {
        marketedPgFallbackLogged = true
        const msg = e instanceof Error ? e.message : String(e)
        console.warn(
          "[marketing] Postgres unreachable; using app/data/trials.json until connection works.",
          msg,
        )
      }
    }
  }
  return trialsJson as Trial[]
}
