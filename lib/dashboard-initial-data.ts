import "server-only"

import { defaultFilters } from "@/app/dashboard/trial-types"
import { runDashboardQuery, type DashboardQueryResult } from "@/lib/dashboard-query"
import { fetchTrialsForRegion } from "@/lib/trials-for-region"

const defaultQueryInput = {
  filters: defaultFilters,
  tablePage: 0,
  tableSort: { field: "enrollment" as const, dir: "desc" as const },
}

export type DashboardInitialPayload = {
  initialUs: DashboardQueryResult
  initialIn: DashboardQueryResult
  initialUk: DashboardQueryResult
  initialEs: DashboardQueryResult
  initialBe: DashboardQueryResult
}

export async function loadDashboardInitialData(): Promise<DashboardInitialPayload> {
  const usTrials = await fetchTrialsForRegion("us").catch(err => {
    console.error("[dashboard] US Postgres unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const inTrials = await fetchTrialsForRegion("in").catch(err => {
    console.error("[dashboard] India trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const ukTrials = await fetchTrialsForRegion("uk").catch(err => {
    console.error("[dashboard] UK trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const esTrials = await fetchTrialsForRegion("es").catch(err => {
    console.error("[dashboard] Spain trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const beTrials = await fetchTrialsForRegion("be").catch(err => {
    console.error("[dashboard] Belgium trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  return {
    initialUs: runDashboardQuery(usTrials, defaultQueryInput, "us"),
    initialIn: runDashboardQuery(inTrials, defaultQueryInput, "in"),
    initialUk: runDashboardQuery(ukTrials, defaultQueryInput, "uk"),
    initialEs: runDashboardQuery(esTrials, defaultQueryInput, "es"),
    initialBe: runDashboardQuery(beTrials, defaultQueryInput, "be"),
  }
}
