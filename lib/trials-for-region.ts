import "server-only"

import type { Trial } from "@/app/dashboard/trial-types"
import type { DashboardRegion } from "@/lib/dashboard-region"
import { trialToUsListRow } from "@/lib/us-trial-detail-map"
import { fetchTrialDetailForRegion as fetchTrialDetailFromDb } from "@/lib/trial-detail-db"
import { fetchTrialsFromPostgres } from "@/lib/trials-from-db"
import { fetchTrialsFromPostgresCtri } from "@/lib/trials-from-db-ctri"
import { fetchTrialsFromPostgresUk } from "@/lib/trials-from-db-uk"
import { trialToUkListTrial } from "@/lib/uk-trial-map"
import { fetchTrialsFromPostgresSpain } from "@/lib/trials-from-db-spain"
import { trialToSpainListTrial } from "@/lib/spain-trial-map"
import { fetchTrialsFromPostgresBelgium } from "@/lib/trials-from-db-belgium"
import { trialToBelgiumListTrial } from "@/lib/belgium-trial-map"
import { CTG_COUNTRY_CONFIGS, trialToCtgCountryListTrial } from "@/lib/ctg-country-trial-map"
import { fetchTrialsFromPostgresCtgCountry } from "@/lib/trials-from-db-ctg-country"

function hasPostgresDsn(): boolean {
  return Boolean(process.env.POSTGRES_DSN?.trim() || process.env.DATABASE_URL?.trim())
}

function requirePostgresDsn(): void {
  if (!hasPostgresDsn()) {
    throw new Error("Set POSTGRES_DSN or DATABASE_URL for dashboard data.")
  }
}

/** All trials for a region — Postgres only (no CSV / file fallback). */
export async function fetchTrialsForRegion(region: DashboardRegion): Promise<Trial[]> {
  requirePostgresDsn()
  if (region === "in") return fetchTrialsFromPostgresCtri()
  if (region === "uk") {
    const uk = await fetchTrialsFromPostgresUk()
    return uk.map(trialToUkListTrial)
  }
  if (region === "es") {
    const es = await fetchTrialsFromPostgresSpain()
    return es.map(trialToSpainListTrial)
  }
  if (region === "be") {
    const be = await fetchTrialsFromPostgresBelgium()
    return be.map(trialToBelgiumListTrial)
  }
  if (CTG_COUNTRY_CONFIGS[region]) {
    const ctg = await fetchTrialsFromPostgresCtgCountry(region)
    return ctg.map(trialToCtgCountryListTrial)
  }
  const us = await fetchTrialsFromPostgres()
  return us.map(trialToUsListRow)
}

/** Full trial for detail sheet / PDF — Postgres list + detail tables. */
export async function fetchTrialDetailForRegion(
  region: DashboardRegion,
  trialId: string,
): Promise<Trial | null> {
  const id = trialId.trim()
  if (!id) return null
  requirePostgresDsn()
  return fetchTrialDetailFromDb(region, id)
}
