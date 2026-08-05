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
  initialDk: DashboardQueryResult
  initialFr: DashboardQueryResult
  initialDe: DashboardQueryResult
  initialIt: DashboardQueryResult
  initialLu: DashboardQueryResult
  initialNl: DashboardQueryResult
  initialNo: DashboardQueryResult
  initialPl: DashboardQueryResult
  initialRu: DashboardQueryResult
  initialSg: DashboardQueryResult
  initialKr: DashboardQueryResult
  initialSe: DashboardQueryResult
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

  const dkTrials = await fetchTrialsForRegion("dk").catch(err => {
    console.error("[dashboard] Denmark trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const frTrials = await fetchTrialsForRegion("fr").catch(err => {
    console.error("[dashboard] France trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const deTrials = await fetchTrialsForRegion("de").catch(err => {
    console.error("[dashboard] Germany trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const itTrials = await fetchTrialsForRegion("it").catch(err => {
    console.error("[dashboard] Italy trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const luTrials = await fetchTrialsForRegion("lu").catch(err => {
    console.error("[dashboard] Luxembourg trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const nlTrials = await fetchTrialsForRegion("nl").catch(err => {
    console.error("[dashboard] Netherlands trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const noTrials = await fetchTrialsForRegion("no").catch(err => {
    console.error("[dashboard] Norway trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const plTrials = await fetchTrialsForRegion("pl").catch(err => {
    console.error("[dashboard] Poland trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const ruTrials = await fetchTrialsForRegion("ru").catch(err => {
    console.error("[dashboard] Russia trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const sgTrials = await fetchTrialsForRegion("sg").catch(err => {
    console.error("[dashboard] Singapore trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const krTrials = await fetchTrialsForRegion("kr").catch(err => {
    console.error("[dashboard] South Korea trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  const seTrials = await fetchTrialsForRegion("se").catch(err => {
    console.error("[dashboard] Sweden trials unavailable", err)
    return [] as Awaited<ReturnType<typeof fetchTrialsForRegion>>
  })

  return {
    initialUs: runDashboardQuery(usTrials, defaultQueryInput, "us"),
    initialIn: runDashboardQuery(inTrials, defaultQueryInput, "in"),
    initialUk: runDashboardQuery(ukTrials, defaultQueryInput, "uk"),
    initialEs: runDashboardQuery(esTrials, defaultQueryInput, "es"),
    initialBe: runDashboardQuery(beTrials, defaultQueryInput, "be"),
    initialDk: runDashboardQuery(dkTrials, defaultQueryInput, "dk"),
    initialFr: runDashboardQuery(frTrials, defaultQueryInput, "fr"),
    initialDe: runDashboardQuery(deTrials, defaultQueryInput, "de"),
    initialIt: runDashboardQuery(itTrials, defaultQueryInput, "it"),
    initialLu: runDashboardQuery(luTrials, defaultQueryInput, "lu"),
    initialNl: runDashboardQuery(nlTrials, defaultQueryInput, "nl"),
    initialNo: runDashboardQuery(noTrials, defaultQueryInput, "no"),
    initialPl: runDashboardQuery(plTrials, defaultQueryInput, "pl"),
    initialRu: runDashboardQuery(ruTrials, defaultQueryInput, "ru"),
    initialSg: runDashboardQuery(sgTrials, defaultQueryInput, "sg"),
    initialKr: runDashboardQuery(krTrials, defaultQueryInput, "kr"),
    initialSe: runDashboardQuery(seTrials, defaultQueryInput, "se"),
  }
}
