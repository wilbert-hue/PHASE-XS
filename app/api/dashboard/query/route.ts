import { NextResponse } from "next/server"
import type { Filters } from "@/app/dashboard/trial-types"
import { defaultFilters } from "@/app/dashboard/trial-types"
import { auth0 } from "@/lib/auth0"
import { parseDashboardRegion } from "@/lib/dashboard-region"
import {
  type DashboardQueryInput,
  type DashboardTableSortField,
  runDashboardQuery,
} from "@/lib/dashboard-query"
import { fetchTrialsForRegion } from "@/lib/trials-for-region"

const SORT_FIELDS: DashboardTableSortField[] = [
  "nctId",
  "molecule",
  "phase",
  "enrollment",
  "dosageStrength",
  "indication",
  "technology",
]

function parseFilters(raw: unknown): Filters {
  if (!raw || typeof raw !== "object") return defaultFilters
  const o = raw as Record<string, unknown>
  const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter(x => typeof x === "string") : [])
  return {
    search: typeof o.search === "string" ? o.search : "",
    phases: strArr(o.phases),
    technologies: strArr(o.technologies),
    indications: strArr(o.indications),
    trialDesigns: strArr(o.trialDesigns),
    routeOfAdmin: strArr(o.routeOfAdmin),
    adminType: strArr(o.adminType),
    recruitmentStatuses: strArr(o.recruitmentStatuses),
  }
}

export async function POST(req: Request) {
  const session = await auth0.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const region = parseDashboardRegion(body.region)
  const filters = parseFilters(body.filters)
  const tablePageRaw = Number(body.tablePage)
  const tablePage = Number.isFinite(tablePageRaw) && tablePageRaw >= 0 ? Math.floor(tablePageRaw) : 0

  let tableSort: DashboardQueryInput["tableSort"] = {
    field: "enrollment",
    dir: "desc",
  }
  const ts = body.tableSort
  if (ts && typeof ts === "object") {
    const o = ts as Record<string, unknown>
    const field = typeof o.field === "string" ? o.field : ""
    const dir = o.dir === "asc" ? "asc" : "desc"
    if (SORT_FIELDS.includes(field as DashboardTableSortField)) {
      tableSort = { field: field as DashboardTableSortField, dir }
    }
  }

  const input: DashboardQueryInput = { filters, tablePage, tableSort }

  try {
    const trials = await fetchTrialsForRegion(region)
    const result = runDashboardQuery(trials, input, region)
    return NextResponse.json({ ...result, region })
  } catch (err) {
    console.error("[api/dashboard/query]", { region, err })
    return NextResponse.json({ error: "Failed to load trials" }, { status: 500 })
  }
}
