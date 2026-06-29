"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Filters } from "@/app/dashboard/trial-types"
import type { DashboardFilterOptions } from "@/lib/dashboard-query"
import type { DashboardRegion } from "@/lib/dashboard-region"
import { getRegionProfile, type FilterFacetKey } from "@/lib/dashboard-region-profile"
import { Search, X, ChevronDown } from "lucide-react"
import { activeSearchTypingSegment, applyMoleculeSuggestion } from "@/lib/molecule-suggestions"
import { selectionCoversCatalog } from "@/lib/dashboard-facets"

interface DashboardFiltersProps {
  region: DashboardRegion
  filters: Filters
  filterOptions: DashboardFilterOptions
  updateFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  resetFilters: () => void
  activeFilterCount: number
  moleculeSearchSuggestions?: string[]
}

function facetState(
  key: FilterFacetKey,
  filters: Filters,
  filterOptions: DashboardFilterOptions,
): { selected: string[]; options: string[]; filterKey: keyof Filters } {
  switch (key) {
    case "phases":
      return { selected: filters.phases, options: filterOptions.phases, filterKey: "phases" }
    case "technologies":
      return {
        selected: filters.technologies,
        options: filterOptions.technologies,
        filterKey: "technologies",
      }
    case "indications":
      return {
        selected: filters.indications,
        options: filterOptions.indications,
        filterKey: "indications",
      }
    case "trialDesigns":
      return {
        selected: filters.trialDesigns,
        options: filterOptions.trialDesigns,
        filterKey: "trialDesigns",
      }
    case "routeOfAdmin":
      return {
        selected: filters.routeOfAdmin,
        options: filterOptions.routes,
        filterKey: "routeOfAdmin",
      }
    case "adminType":
      return { selected: filters.adminType, options: filterOptions.adminTypes, filterKey: "adminType" }
    case "recruitmentStatuses":
      return {
        selected: filters.recruitmentStatuses,
        options: filterOptions.recruitmentStatuses,
        filterKey: "recruitmentStatuses",
      }
  }
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
  accent = "#2563EB",
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (val: string[]) => void
  accent?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const btnRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  const filtered = search
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options

  const allSelected = useMemo(
    () => options.length > 0 && selectionCoversCatalog(selected, options),
    [options, selected],
  )

  const allCheckboxRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const el = allCheckboxRef.current
    if (!el) return
    el.indeterminate = selected.length > 0 && !allSelected
  }, [selected.length, allSelected])

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [open])

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="group w-full flex flex-col text-left font-mono text-sm transition-colors relative overflow-hidden rounded-md shadow-sm"
        style={{
          border: `1px solid ${accent}50`,
          background: `linear-gradient(165deg, ${accent}20 0%, ${accent}0a 45%, ${accent}06 100%)`,
          color: accent,
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = `linear-gradient(165deg, ${accent}2e 0%, ${accent}16 50%, ${accent}0c 100%)`
          e.currentTarget.style.borderColor = `${accent}aa`
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = `linear-gradient(165deg, ${accent}20 0%, ${accent}0a 45%, ${accent}06 100%)`
          e.currentTarget.style.borderColor = `${accent}50`
        }}
      >
        <div
          className="h-1 w-full shrink-0"
          style={{
            background: `linear-gradient(90deg, ${accent}, ${accent}99, ${accent}40)`,
            boxShadow: `inset 0 -1px 0 ${accent}30`,
          }}
        />
        <div className="flex items-center justify-between gap-2 px-3 py-2 w-full min-h-[2.5rem]">
          <span className="truncate text-left font-medium">
            {selected.length === 0
              ? label
              : allSelected
                ? `${label} (All)`
                : `${label} (${selected.length})`}
          </span>
          <span style={{ color: accent }}>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </span>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[998]" onClick={() => { setOpen(false); setSearch("") }} />
            <motion.div
              data-lenis-prevent-wheel
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                ...dropdownStyle,
                borderColor: `${accent}40`,
                boxShadow: `0 10px 40px -10px ${accent}30`,
              }}
              className="z-[999] border-2 bg-background/95 backdrop-blur-sm shadow-xl max-h-64 overflow-hidden flex flex-col overscroll-contain rounded-md"
            >
              {options.length > 8 && (
                <div
                  className="shrink-0 p-2 border-b"
                  style={{ borderColor: `${accent}25`, background: `${accent}08` }}
                >
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                </div>
              )}
              <div
                className="shrink-0 px-2 py-1.5 border-b"
                style={{ borderColor: `${accent}25`, background: `${accent}06` }}
              >
                <label
                  title='Select every item in this list ("All" unchecked when nothing is selected)'
                  className={`flex items-center gap-2 px-2 py-1 rounded transition-colors min-w-0 ${
                    options.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  onMouseEnter={e => {
                    if (options.length === 0) return
                    e.currentTarget.style.background = `${accent}14`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "transparent"
                  }}
                >
                  <input
                    ref={allCheckboxRef}
                    type="checkbox"
                    checked={allSelected}
                    disabled={options.length === 0}
                    onChange={e => {
                      if (options.length === 0) return
                      if (e.target.checked) onChange([...options])
                      else onChange([])
                    }}
                    className="h-3 w-3 rounded border-border shrink-0"
                    style={{ accentColor: accent }}
                  />
                  <span className="font-mono text-sm font-medium">All</span>
                </label>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-1">
                {filtered.length === 0 && (
                  <p className="px-2 py-3 font-mono text-[12px] text-muted-foreground text-center">No matches</p>
                )}
                {filtered.map(option => (
                  <label
                    key={option}
                    title={option}
                    className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors min-w-0"
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `${accent}14`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "transparent"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={() => {
                        onChange(
                          selected.includes(option)
                            ? selected.filter(s => s !== option)
                            : [...selected, option],
                        )
                      }}
                      className="h-3 w-3 rounded border-border shrink-0"
                      style={{ accentColor: accent }}
                    />
                    <span className="font-mono text-sm truncate min-w-0">{option}</span>
                  </label>
                ))}
              </div>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="shrink-0 border-t p-2 font-mono text-[12px] uppercase tracking-wider w-full text-center transition-colors"
                  style={{ borderColor: `${accent}30`, color: accent, background: `${accent}0a` }}
                >
                  Clear selection
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DashboardFilters({
  region,
  filters,
  filterOptions,
  updateFilter,
  resetFilters,
  activeFilterCount,
  moleculeSearchSuggestions = [],
}: DashboardFiltersProps) {
  const profile = getRegionProfile(region)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const searchWrapRef = useRef<HTMLDivElement>(null)

  const typingSegment = useMemo(() => activeSearchTypingSegment(filters.search), [filters.search])

  useEffect(() => {
    const n = moleculeSearchSuggestions.length
    setHighlight(h => (n === 0 ? 0 : Math.min(h, n - 1)))
  }, [moleculeSearchSuggestions])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!searchWrapRef.current?.contains(e.target as Node)) setSuggestOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const suggestionsVisible =
    suggestOpen && typingSegment.length >= 2 && moleculeSearchSuggestions.length > 0

  const commitSuggestion = (label: string) => {
    updateFilter("search", applyMoleculeSuggestion(filters.search, label))
    setSuggestOpen(false)
  }

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestionsVisible) {
      if (e.key === "Escape") setSuggestOpen(false)
      return
    }
    if (e.key === "Escape") {
      e.preventDefault()
      setSuggestOpen(false)
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight(h => Math.min(h + 1, moleculeSearchSuggestions.length - 1))
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight(h => Math.max(h - 1, 0))
      return
    }
    if (e.key === "Enter") {
      e.preventDefault()
      const row = moleculeSearchSuggestions[highlight]
      if (row) commitSuggestion(row)
    }
  }

  const facetCount = profile.filterFacets.length
  const gridCols =
    facetCount <= 5
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
      : "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div ref={searchWrapRef} className="relative flex-1 z-[100]">
          <div className="flex items-center gap-2 border border-border bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={suggestionsVisible}
              aria-controls="dash-molecule-suggestions"
              id="dash-search-query"
              placeholder={profile.searchPlaceholder}
              value={filters.search}
              onChange={e => {
                updateFilter("search", e.target.value)
                setSuggestOpen(true)
              }}
              onFocus={() => setSuggestOpen(true)}
              onBlur={() => {
                queueMicrotask(() => {
                  if (!searchWrapRef.current?.contains(document.activeElement)) setSuggestOpen(false)
                })
              }}
              onKeyDown={onSearchKeyDown}
              className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground/50"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => updateFilter("search", "")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          {suggestionsVisible && (
            <ul
              id="dash-molecule-suggestions"
              data-lenis-prevent-wheel
              role="listbox"
              aria-labelledby="dash-search-query"
              className="absolute left-0 right-0 mt-1 max-h-52 overflow-y-auto overscroll-contain border border-border bg-background shadow-lg z-[110]"
            >
              {moleculeSearchSuggestions.map((label, i) => (
                <li key={`${label}-${i}`} role="option" aria-selected={i === highlight}>
                  <button
                    type="button"
                    title={label}
                    className={`w-full text-left px-3 py-2 font-mono text-sm transition-colors truncate ${
                      i === highlight ? "bg-accent text-accent-foreground" : "hover:bg-muted/80"
                    }`}
                    onMouseEnter={() => setHighlight(i)}
                    onMouseDown={e => {
                      e.preventDefault()
                      commitSuggestion(label)
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="font-mono text-[12px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset ({activeFilterCount})
          </button>
        )}
      </div>

      <div
        className={`grid ${gridCols} gap-3 p-4 rounded-lg border border-border/70 overflow-hidden`}
        style={{
          background:
            "linear-gradient(125deg, rgba(37,99,235,0.07) 0%, rgba(109,40,217,0.06) 25%, rgba(180,83,9,0.06) 50%, rgba(14,116,144,0.07) 75%, rgba(4,120,87,0.05) 100%)",
        }}
      >
        {profile.filterFacets.map(facet => {
          const { selected, options, filterKey } = facetState(facet.key, filters, filterOptions)
          return (
            <MultiSelect
              key={facet.key}
              label={facet.label}
              accent={facet.accent}
              options={options}
              selected={selected}
              onChange={v => updateFilter(filterKey, v)}
            />
          )
        })}
      </div>
    </div>
  )
}
