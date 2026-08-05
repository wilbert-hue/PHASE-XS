"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import type { User } from "@auth0/nextjs-auth0/types"
import type { Trial, Filters } from "@/app/dashboard/trial-types"
import { defaultFilters } from "@/app/dashboard/trial-types"
import { DashboardKPIs } from "@/components/dashboard/kpi-cards"
import { DashboardCharts } from "@/components/dashboard/charts"
import { TrialsTable } from "@/components/dashboard/trials-table"
import { DashboardFilters } from "@/components/dashboard/filters"
import { TrialDetailSheet } from "@/components/dashboard/trial-detail-sheet"
import { ComparisonPanel } from "@/components/dashboard/comparison-panel"
import { InsightsPanel } from "@/components/dashboard/insights-panel"
import { PageSection } from "@/components/page-section"
import { facetApplied } from "@/lib/dashboard-facets"
import { getRegionProfile } from "@/lib/dashboard-region-profile"
import type { DashboardQueryResult, DashboardTableSortField } from "@/lib/dashboard-query"
import type { DashboardRegion } from "@/lib/dashboard-region"
import { DashboardRegionTabs } from "@/components/dashboard/region-tabs"
import { ArrowLeft, User as UserIcon, Search as SearchIcon, FileText, Trash2, X, LogOut } from "lucide-react"

interface ViewedTrialEntry {
  nctId: string
  molecule: string
  indication: string
  at: number
}

const HISTORY_KEY = "phase-xs:user-history"
const MAX_HISTORY = 20

export default function DashboardClient({
  user,
  initialUs,
  initialIn,
  initialUk,
  initialEs,
  initialBe,
  initialDk,
  initialFr,
  initialDe,
  initialIt,
  initialLu,
  initialNl,
  initialNo,
  initialPl,
  initialRu,
  initialSg,
  initialKr,
  initialSe,
}: {
  user: User
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
}) {
  const [region, setRegion] = useState<DashboardRegion>("us")
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [data, setData] = useState<DashboardQueryResult>(initialUs)
  const [tablePage, setTablePage] = useState(initialUs.tablePage)
  const [tableSort, setTableSort] = useState<{ field: DashboardTableSortField; dir: "asc" | "desc" }>(() => ({
    field: "enrollment",
    dir: "desc",
  }))
  const [pending, setPending] = useState(false)

  const [selectedTrial, setSelectedTrialState] = useState<Trial | null>(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [viewedHistory, setViewedHistory] = useState<ViewedTrialEntry[]>([])
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const filtersKeyRef = useRef(JSON.stringify(defaultFilters))
  const skipHydrationFetchRef = useRef(true)


  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setSearchHistory(parsed.searches || [])
        setViewedHistory(parsed.viewed || [])
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify({ searches: searchHistory, viewed: viewedHistory }),
      )
    } catch {}
  }, [searchHistory, viewedHistory])

  useEffect(() => {
    const term = filters.search.trim()
    if (!term) return
    const id = setTimeout(() => {
      setSearchHistory(prev => {
        const next = [term, ...prev.filter(s => s.toLowerCase() !== term.toLowerCase())]
        return next.slice(0, MAX_HISTORY)
      })
    }, 600)
    return () => clearTimeout(id)
  }, [filters.search])

  const setSelectedTrial = useCallback((t: Trial | null) => {
    setSelectedTrialState(t)
    if (t) {
      setViewedHistory(prev => {
        const entry: ViewedTrialEntry = {
          nctId: t.nctId,
          molecule: t.molecule,
          indication: t.indication,
          at: Date.now(),
        }
        const next = [entry, ...prev.filter(v => v.nctId !== t.nctId)]
        return next.slice(0, MAX_HISTORY)
      })
    }
  }, [])

  useEffect(() => {
    if (!userMenuOpen) return
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [userMenuOpen])

  const clearHistory = () => {
    setSearchHistory([])
    setViewedHistory([])
  }

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setTablePage(0)
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setTablePage(0)
    setFilters(defaultFilters)
  }, [])

  const switchRegion = useCallback(
    (next: DashboardRegion) => {
      if (next === region) return
      setRegion(next)
      setFilters(defaultFilters)
      setTablePage(0)
      setTableSort({ field: "enrollment", dir: "desc" })
      setData(
        next === "us" ? initialUs
        : next === "in" ? initialIn
        : next === "uk" ? initialUk
        : next === "es" ? initialEs
        : next === "be" ? initialBe
        : next === "dk" ? initialDk
        : next === "fr" ? initialFr
        : next === "de" ? initialDe
        : next === "it" ? initialIt
        : next === "lu" ? initialLu
        : next === "nl" ? initialNl
        : next === "no" ? initialNo
        : next === "pl" ? initialPl
        : next === "ru" ? initialRu
        : next === "sg" ? initialSg
        : next === "kr" ? initialKr
        : next === "se" ? initialSe
        : initialUs
      )
      filtersKeyRef.current = JSON.stringify(defaultFilters)
      skipHydrationFetchRef.current = true
      setSelectedTrialState(null)
    },
    [region, initialUs, initialIn, initialUk, initialEs, initialBe, initialDk, initialFr, initialDe, initialIt, initialLu, initialNl, initialNo, initialPl, initialRu, initialSg, initialKr, initialSe],
  )

  const fetchDashboard = useCallback(async () => {
    setPending(true)
    try {
      const res = await fetch("/api/dashboard/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          region,
          filters,
          tablePage,
          tableSort,
        }),
      })
      if (res.status === 401) {
        window.location.href = "/auth/login?returnTo=/dashboard"
        return
      }
      if (!res.ok) {
        console.error("[dashboard] query failed", res.status)
        return
      }
      const next = (await res.json()) as DashboardQueryResult
      setData(next)
      setTablePage(next.tablePage)
    } catch (e) {
      console.error("[dashboard] query error", e)
    } finally {
      setPending(false)
    }
  }, [region, filters, tablePage, tableSort])

  const filtersKey = JSON.stringify(filters)
  const sortKey = `${tableSort.field}:${tableSort.dir}`

  useEffect(() => {
    if (skipHydrationFetchRef.current) {
      skipHydrationFetchRef.current = false
      filtersKeyRef.current = filtersKey
      return
    }
    const changed = filtersKeyRef.current !== filtersKey
    filtersKeyRef.current = filtersKey
    const delay = changed ? 320 : 0
    const id = setTimeout(() => {
      void fetchDashboard()
    }, delay)
    return () => clearTimeout(id)
  }, [filtersKey, tablePage, sortKey, region, fetchDashboard])

  const openTrialByNctId = useCallback(async (nctId: string) => {
    try {
      const res = await fetch(
        `/api/dashboard/trial/${encodeURIComponent(nctId)}?region=${region}`,
        { credentials: "same-origin" },
      )
      if (res.status === 401) {
        window.location.href = "/auth/login?returnTo=/dashboard"
        return
      }
      if (!res.ok) return
      const trial = (await res.json()) as Trial
      setSelectedTrial(trial)
    } catch (e) {
      console.error("[dashboard] trial fetch", e)
    }
  }, [setSelectedTrial, region])

  const regionProfile = getRegionProfile(region)
  const footerLabel = `${regionProfile.footerPrefix} / ${data.totalTrialCount.toLocaleString()} Records`

  const searchTerms = data.searchTerms
  const isComparing = searchTerms.length >= 2

  const filterOptions = data.filterOptions
  const activeFilterCount = regionProfile.filterFacets.reduce((n, facet) => {
    switch (facet.key) {
      case "phases":
        return n + Number(facetApplied(filters.phases, filterOptions.phases))
      case "technologies":
        return n + Number(facetApplied(filters.technologies, filterOptions.technologies))
      case "indications":
        return n + Number(facetApplied(filters.indications, filterOptions.indications))
      case "trialDesigns":
        return n + Number(facetApplied(filters.trialDesigns, filterOptions.trialDesigns))
      case "routeOfAdmin":
        return n + Number(facetApplied(filters.routeOfAdmin, filterOptions.routes))
      case "adminType":
        return n + Number(facetApplied(filters.adminType, filterOptions.adminTypes))
      case "recruitmentStatuses":
        return n + Number(facetApplied(filters.recruitmentStatuses, filterOptions.recruitmentStatuses))
      default:
        return n
    }
  }, 0)

  const handleSortChange = useCallback((field: DashboardTableSortField) => {
    setTableSort(prev =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "desc" },
    )
    setTablePage(0)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-bg fixed inset-0 opacity-20" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
            <div className="flex min-h-[4.25rem] py-2 items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Link>
                <div className="h-4 w-px bg-border" />
                <h1 className="font-[var(--font-bebas)] text-3xl tracking-wider">
                  PHASE-XS
                </h1>
                <span className="hidden sm:inline-block font-mono text-[12px] uppercase tracking-widest text-muted-foreground border border-border px-2 py-0.5">
                  Clinical Trials Dashboard
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-mono text-[12px] text-muted-foreground ${pending ? "opacity-60" : ""}`}>
                  {data.filteredCount.toLocaleString()} / {data.totalTrialCount.toLocaleString()} trials
                </span>
                {user.email && (
                  <span
                    className="hidden md:inline max-w-[min(100%,22rem)] truncate font-mono text-[12px] text-muted-foreground border border-border/80 px-2 py-0.5 rounded"
                    title={user.email}
                  >
                    {user.email}
                  </span>
                )}
                <a
                  href="/auth/logout"
                  className="inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-[rgba(42,143,156,0.6)] transition-colors"
                >
                  <LogOut className="h-3 w-3" />
                  Sign out
                </a>

                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    aria-label="User history"
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground hover:text-foreground hover:border-[rgba(42,143,156,0.6)] transition-colors"
                  >
                    <UserIcon className="h-4 w-4" />
                    {(searchHistory.length > 0 || viewedHistory.length > 0) && (
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#2A8F9C]" />
                    )}
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto overscroll-contain rounded-md border border-border bg-background/95 backdrop-blur-xl shadow-2xl z-50"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                        <span className="font-mono text-[12px] uppercase tracking-widest text-muted-foreground">
                          Your Activity
                        </span>
                        <div className="flex items-center gap-1">
                          {(searchHistory.length > 0 || viewedHistory.length > 0) && (
                            <button
                              type="button"
                              onClick={clearHistory}
                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Clear history"
                            >
                              <Trash2 className="h-3 w-3" />
                              Clear
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setUserMenuOpen(false)}
                            className="inline-flex items-center justify-center rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Close"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="px-3 py-2">
                        <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
                          <SearchIcon className="h-3 w-3" />
                          <span className="font-mono text-[11px] uppercase tracking-widest">
                            Recent Searches
                          </span>
                        </div>
                        {searchHistory.length === 0 ? (
                          <p className="font-mono text-[12px] text-muted-foreground/70 pl-4">
                            No searches yet
                          </p>
                        ) : (
                          <ul className="space-y-0.5">
                            {searchHistory.map((s, i) => (
                              <li key={`${s}-${i}`} className="group/item flex items-center rounded hover:bg-muted">
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateFilter("search", s)
                                    setUserMenuOpen(false)
                                  }}
                                  className="flex-1 text-left truncate px-2 py-1 font-mono text-sm text-foreground/90 hover:text-foreground transition-colors"
                                >
                                  {s}
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Remove search ${s}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSearchHistory(prev => prev.filter(x => x !== s))
                                  }}
                                  className="mr-1 inline-flex items-center justify-center rounded p-0.5 text-muted-foreground/60 opacity-0 group-hover/item:opacity-100 hover:text-foreground hover:bg-background transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="border-t border-border" />

                      <div className="px-3 py-2">
                        <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span className="font-mono text-[11px] uppercase tracking-widest">
                            Viewed Reports
                          </span>
                        </div>
                        {viewedHistory.length === 0 ? (
                          <p className="font-mono text-[12px] text-muted-foreground/70 pl-4">
                            No reports viewed yet
                          </p>
                        ) : (
                          <ul className="space-y-0.5">
                            {viewedHistory.map(v => (
                              <li key={v.nctId}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    void openTrialByNctId(v.nctId)
                                    setUserMenuOpen(false)
                                  }}
                                  className="w-full text-left rounded px-2 py-1 hover:bg-muted transition-colors"
                                >
                                  <div className="font-mono text-sm text-foreground/90 truncate">
                                    {v.nctId}
                                  </div>
                                  <div className="font-mono text-[11px] text-muted-foreground truncate">
                                    {v.molecule || "—"} · {v.indication || "—"}
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main
          className={`mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pt-6 pb-4 transition-opacity ${pending ? "opacity-[0.92]" : ""}`}
        >
          <div className="mb-4">
            <DashboardRegionTabs
              region={region}
              onChange={switchRegion}
              usCount={initialUs.totalTrialCount}
              inCount={initialIn.totalTrialCount}
              ukCount={initialUk.totalTrialCount}
              esCount={initialEs.totalTrialCount}
              beCount={initialBe.totalTrialCount}
              dkCount={initialDk.totalTrialCount}
              frCount={initialFr.totalTrialCount}
              deCount={initialDe.totalTrialCount}
              itCount={initialIt.totalTrialCount}
              luCount={initialLu.totalTrialCount}
              nlCount={initialNl.totalTrialCount}
              noCount={initialNo.totalTrialCount}
              plCount={initialPl.totalTrialCount}
              ruCount={initialRu.totalTrialCount}
              sgCount={initialSg.totalTrialCount}
              krCount={initialKr.totalTrialCount}
              seCount={initialSe.totalTrialCount}
            />
          </div>

          <div className="relative z-0 mb-4">
            <InsightsPanel region={region} moleculeTokenCatalog={data.moleculeTokenCatalog} />
          </div>

          <div className="relative z-40">
            <PageSection page="dashboard" variant="filters" className="p-4 sm:p-5">
              <DashboardFilters
                region={region}
                filters={filters}
                filterOptions={filterOptions}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                activeFilterCount={activeFilterCount}
                moleculeSearchSuggestions={data.moleculeSearchSuggestions}
              />
            </PageSection>
          </div>

          <PageSection
            page="dashboard"
            variant="data"
            className="relative z-0 mt-6 space-y-6"
          >
            {isComparing && <ComparisonPanel region={region} groups={data.comparison} />}
            <DashboardKPIs
              region={region}
              filteredTrialCount={data.filteredCount}
              kpi={data.kpi}
            />
            <DashboardCharts region={region} charts={data.charts} />
          </PageSection>

          <PageSection page="dashboard" variant="table" className="relative z-0 mt-6">
            <TrialsTable
              region={region}
              rows={data.tableRows}
              totalFiltered={data.filteredCount}
              page={data.tablePage}
              totalPages={data.tableTotalPages}
              sortField={tableSort.field}
              sortDir={tableSort.dir}
              onPageChange={setTablePage}
              onSortChange={handleSortChange}
              onSelectTrial={setSelectedTrial}
            />
          </PageSection>
        </main>

        <footer className="border-t border-border py-4 mt-6">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
            <p className="font-mono text-[12px] uppercase tracking-widest text-muted-foreground">
              {footerLabel}
            </p>
          </div>
        </footer>
      </div>

      <TrialDetailSheet
        trial={selectedTrial}
        region={region}
        onClose={() => setSelectedTrial(null)}
      />
    </div>
  )
}
