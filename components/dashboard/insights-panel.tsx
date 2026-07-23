"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Sparkles,
  Search,
  X,
  Loader2,
  Database,
  FlaskConical,
  Users,
  UsersRound,
  Clock,
  Building2,
  Stethoscope,
  Dna,
  Syringe,
  Pill,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { DashboardRegion } from "@/lib/dashboard-region"
import type { InsightsResult, InsightTakeaway } from "@/lib/insights-query"

const ICON_MAP: Record<string, React.ReactNode> = {
  database: <Database className="h-3.5 w-3.5" />,
  flask: <FlaskConical className="h-3.5 w-3.5" />,
  users: <Users className="h-3.5 w-3.5" />,
  "users-round": <UsersRound className="h-3.5 w-3.5" />,
  clock: <Clock className="h-3.5 w-3.5" />,
  building: <Building2 className="h-3.5 w-3.5" />,
  stethoscope: <Stethoscope className="h-3.5 w-3.5" />,
  dna: <Dna className="h-3.5 w-3.5" />,
  syringe: <Syringe className="h-3.5 w-3.5" />,
  pill: <Pill className="h-3.5 w-3.5" />,
  calendar: <Calendar className="h-3.5 w-3.5" />,
}

const REGION_PLACEHOLDER: Record<DashboardRegion, string> = {
  us: "Ask about a molecule, drug class, technology, or condition… e.g. rituximab, CAR-T, breast cancer",
  in: "Ask about an intervention, condition, or sponsor… e.g. methotrexate, lung cancer, AIIMS",
  uk: "Ask about a drug, condition, or sponsor… e.g. pembrolizumab, breast cancer, Cancer Research UK",
  es: "Ask about a product, condition, or sponsor… e.g. nivolumab, bladder cancer, Roche",
  be: "Ask about a drug, condition, or sponsor… e.g. pembrolizumab, colorectal cancer, UCB",
}

const REGION_LABEL: Record<DashboardRegion, string> = {
  us: "United States",
  in: "India",
  uk: "United Kingdom",
  es: "Spain",
  be: "Belgium",
}

const SUGGESTION_LIMIT = 10
const MIN_CHARS = 2

function getSuggestions(catalog: string[], fragment: string): string[] {
  const q = fragment.trim().toLowerCase()
  if (q.length < MIN_CHARS) return []
  const hits: string[] = []
  for (const token of catalog) {
    if (token.toLowerCase().startsWith(q)) hits.push(token)
    if (hits.length >= SUGGESTION_LIMIT) break
  }
  return hits
}

function TakeawayCard({ item, index }: { item: InsightTakeaway; index: number }) {
  return (
    <div
      className="group flex gap-3 rounded-lg border border-border/60 bg-background/60 px-4 py-3 hover:border-[rgba(42,143,156,0.4)] hover:bg-background/80 transition-all duration-150"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="mt-0.5 flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-md bg-[rgba(42,143,156,0.12)] text-[#2A8F9C]">
        {ICON_MAP[item.icon] ?? <Sparkles className="h-3.5 w-3.5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#2A8F9C]/80">
            {item.category}
          </span>
          <span className="inline-block rounded bg-[rgba(42,143,156,0.12)] px-1.5 py-0 font-mono text-[11px] font-medium text-[#2A8F9C] leading-5">
            {item.highlight}
          </span>
        </div>
        <p className="font-mono text-[12.5px] leading-relaxed text-foreground/80">
          {item.text}
        </p>
      </div>
    </div>
  )
}

interface InsightsPanelProps {
  region: DashboardRegion
  moleculeTokenCatalog: string[]
}

export function InsightsPanel({ region, moleculeTokenCatalog }: InsightsPanelProps) {
  const [query, setQuery] = useState("")
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<InsightsResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestionIndex, setSuggestionIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLUListElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset on region switch
  useEffect(() => {
    setResult(null)
    setError(null)
    setQuery("")
    setSuggestions([])
    setShowSuggestions(false)
  }, [region])

  // Close suggestions on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  // Recompute suggestions whenever query or catalog changes
  useEffect(() => {
    const hits = getSuggestions(moleculeTokenCatalog, query)
    setSuggestions(hits)
    setSuggestionIndex(-1)
    setShowSuggestions(hits.length > 0)
  }, [query, moleculeTokenCatalog])

  const applySuggestion = useCallback((token: string) => {
    setQuery(token)
    setSuggestions([])
    setShowSuggestions(false)
    setSuggestionIndex(-1)
    inputRef.current?.focus()
  }, [])

  const runInsights = useCallback(
    async (q: string) => {
      const trimmed = q.trim()
      if (!trimmed) return

      if (abortRef.current) abortRef.current.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl

      setShowSuggestions(false)
      setPending(true)
      setError(null)
      setResult(null)

      try {
        const res = await fetch("/api/dashboard/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ query: trimmed, region }),
          signal: ctrl.signal,
        })
        if (res.status === 401) {
          window.location.href = "/auth/login?returnTo=/dashboard"
          return
        }
        if (!res.ok) {
          setError("Failed to generate insights. Please try again.")
          return
        }
        const data = (await res.json()) as InsightsResult
        setResult(data)
        setExpanded(true)
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return
        setError("Something went wrong. Please try again.")
      } finally {
        setPending(false)
      }
    },
    [region],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalQuery = suggestionIndex >= 0 && suggestions[suggestionIndex]
      ? suggestions[suggestionIndex]
      : query
    setQuery(finalQuery)
    setShowSuggestions(false)
    void runInsights(finalQuery)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSuggestionIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSuggestionIndex(i => Math.max(i - 1, -1))
    } else if (e.key === "Enter" && suggestionIndex >= 0) {
      e.preventDefault()
      const picked = suggestions[suggestionIndex]
      applySuggestion(picked)
      void runInsights(picked)
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
      setSuggestionIndex(-1)
    }
  }

  const handleClear = () => {
    setQuery("")
    setResult(null)
    setError(null)
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Scroll active suggestion into view
  useEffect(() => {
    if (suggestionIndex < 0 || !suggestionsRef.current) return
    const el = suggestionsRef.current.children[suggestionIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: "nearest" })
  }, [suggestionIndex])

  return (
    <div className="rounded-xl border border-border/80 bg-background/40 backdrop-blur-sm">
      {/* Header bar */}
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3 rounded-t-xl">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#2A8F9C]/20 to-[#2A8F9C]/5">
          <Sparkles className="h-3.5 w-3.5 text-[#2A8F9C]" />
        </div>
        <span className="font-mono text-[11px] uppercase tracking-widest text-foreground/70">
          Data Insights
        </span>
        <span className="rounded border border-border/60 px-1.5 py-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground leading-5">
          {REGION_LABEL[region]}
        </span>
      </div>

      {/* Search bar */}
      <div className="px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div ref={containerRef} className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#2A8F9C]" />
              ) : (
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true)
              }}
              placeholder={REGION_PLACEHOLDER[region]}
              disabled={pending}
              autoComplete="off"
              className="h-10 w-full rounded-lg border border-border bg-background/60 pl-9 pr-9 font-mono text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-[rgba(42,143,156,0.6)] focus:outline-none focus:ring-1 focus:ring-[rgba(42,143,156,0.25)] disabled:opacity-60 transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-2.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul
                ref={suggestionsRef}
                className="absolute left-0 right-0 top-[calc(100%+4px)] z-[60] max-h-56 overflow-y-auto rounded-lg border border-border/80 bg-background shadow-xl"
              >
                {suggestions.map((s, i) => {
                  const prefixLen = query.trim().length
                  const isActive = i === suggestionIndex
                  return (
                    <li key={s}>
                      <button
                        type="button"
                        onMouseDown={e => {
                          e.preventDefault()
                          applySuggestion(s)
                          void runInsights(s)
                        }}
                        onMouseEnter={() => setSuggestionIndex(i)}
                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                          isActive
                            ? "bg-[rgba(42,143,156,0.1)] text-foreground"
                            : "text-foreground/80 hover:bg-muted/60"
                        }`}
                      >
                        <Search className="h-3 w-3 flex-shrink-0 text-[#2A8F9C]/50" />
                        <span className="font-mono text-[12.5px]">
                          <span className="font-semibold text-[#2A8F9C]">
                            {s.slice(0, prefixLen)}
                          </span>
                          <span className="text-foreground/70">{s.slice(prefixLen)}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={!query.trim() || pending}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[rgba(42,143,156,0.5)] bg-[rgba(42,143,156,0.08)] px-4 font-mono text-[12px] uppercase tracking-widest text-[#2A8F9C] hover:bg-[rgba(42,143,156,0.16)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            Analyse
          </button>
        </form>

        <p className="mt-1.5 font-mono text-[11px] text-muted-foreground/60">
          Insights are derived exclusively from trial records in the {REGION_LABEL[region]} dataset.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
          <p className="font-mono text-[12px] text-destructive">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && !error && (
        <div className="border-t border-border/40">
          {/* Summary card — always visible */}
          <div className="mx-4 mt-4 rounded-lg border border-[rgba(42,143,156,0.3)] bg-gradient-to-r from-[rgba(42,143,156,0.08)] to-[rgba(42,143,156,0.03)] px-4 py-3.5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(42,143,156,0.15)]">
                <Sparkles className="h-4 w-4 text-[#2A8F9C]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#2A8F9C]/70">
                    Summary
                  </span>
                  <span className="font-mono text-[11px] font-medium text-foreground/90">
                    "{result.query}"
                  </span>
                  <span className="rounded-full border border-[rgba(42,143,156,0.4)] bg-[rgba(42,143,156,0.1)] px-2 py-0 font-mono text-[10px] text-[#2A8F9C] leading-5">
                    {result.matchCount.toLocaleString()} trial{result.matchCount !== 1 ? "s" : ""} · {REGION_LABEL[region]}
                  </span>
                </div>
                {result.noResults ? (
                  <p className="font-mono text-[12.5px] text-muted-foreground">
                    No trials matched "{result.query}" in the {REGION_LABEL[region]} dataset. Try a different molecule name, drug class, or condition.
                  </p>
                ) : (
                  <p className="font-mono text-[12.5px] leading-relaxed text-foreground/75">
                    {result.summary}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Expand / collapse toggle for detailed takeaways */}
          {!result.noResults && (
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Detailed Takeaways
              </span>
              <button
                type="button"
                onClick={() => setExpanded(v => !v)}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {expanded ? (
                  <>Hide <ChevronUp className="h-3 w-3" /></>
                ) : (
                  <>Show {result.takeaways.length} <ChevronDown className="h-3 w-3" /></>
                )}
              </button>
            </div>
          )}

          {!result.noResults && expanded ? (
            <div className="grid gap-2 p-4 pt-2 sm:grid-cols-2">
              {result.takeaways.map((item, i) => (
                <TakeawayCard key={item.category} item={item} index={i} />
              ))}
            </div>
          ) : !result.noResults ? (
            <div className="pb-4" />
          ) : (
            <div className="pb-4" />
          )}
        </div>
      )}
    </div>
  )
}
