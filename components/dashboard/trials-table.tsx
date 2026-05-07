"use client"

import { useState, useMemo, useEffect } from "react"
import type { Trial } from "@/app/dashboard/trial-types"
import { normalizePhase } from "@/app/dashboard/trial-types"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ExternalLink } from "lucide-react"

const PAGE_SIZE = 10

type SortField =
  | "nctId"
  | "molecule"
  | "phase"
  | "enrollment"
  | "dosageStrength"
  | "indication"
  | "technology"
type SortDir = "asc" | "desc"

export function TrialsTable({
  trials,
  onSelectTrial,
}: {
  trials: Trial[]
  onSelectTrial: (t: Trial) => void
}) {
  const [page, setPage] = useState(0)
  const [sortField, setSortField] = useState<SortField>("enrollment")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const sorted = useMemo(() => {
    const arr = [...trials]
    arr.sort((a, b) => {
      let av: string | number = a[sortField] ?? ""
      let bv: string | number = b[sortField] ?? ""
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av
      }
      av = String(av).toLowerCase()
      bv = String(bv).toLowerCase()
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return arr
  }, [trials, sortField, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  useEffect(() => {
    setPage(0)
  }, [trials])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => toggleSort(field)}
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      <ArrowUpDown className={`h-2.5 w-2.5 ${sortField === field ? "text-foreground" : "text-muted-foreground/40"}`} />
    </button>
  )

  return (
    <div className="border border-border bg-background/60 backdrop-blur-sm">
      {/* Table header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h3 className="font-mono text-[12px] uppercase tracking-widest text-muted-foreground">
          Trial Records
        </h3>
        <span className="font-mono text-[12px] text-muted-foreground">
          {sorted.length.toLocaleString()} results
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border">
              {([
                ["nctId", "NCT ID"],
                ["molecule", "Molecule"],
                ["phase", "Phase"],
                ["indication", "Indication"],
                ["technology", "Technology"],
                ["enrollment", "Enrollment"],
                ["dosageStrength", "Dose"],
              ] as [SortField, string][]).map(([field, label]) => (
                <th
                  key={field}
                  className="px-4 py-2 text-left font-mono text-[12px] uppercase tracking-widest text-muted-foreground font-normal"
                >
                  <SortHeader field={field}>{label}</SortHeader>
                </th>
              ))}
              <th className="px-4 py-2 text-left font-mono text-[12px] uppercase tracking-widest text-muted-foreground font-normal">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center font-mono text-sm text-muted-foreground">
                  No trials found
                </td>
              </tr>
            ) : (
              pageData.map((trial, i) => (
                <tr
                  key={trial.nctId + "-" + i}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onSelectTrial(trial)}
                >
                  <td className="px-4 py-2 font-mono text-sm text-accent">
                    {trial.nctId}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm font-medium max-w-[160px] truncate">
                    {trial.molecule || "—"}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-block border border-border px-2 py-0.5 font-mono text-[12px]">
                      {normalizePhase(trial.phase)}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-sm max-w-[200px] truncate text-muted-foreground">
                    {trial.indication
                      ? trial.indication.charAt(0) + trial.indication.slice(1).toLowerCase()
                      : "—"}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm max-w-[160px] truncate text-muted-foreground">
                    {trial.technology || "—"}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm tabular-nums">
                    {trial.enrollment ? trial.enrollment.toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm max-w-[120px] truncate text-muted-foreground" title={trial.dosageStrength || undefined}>
                    {trial.dosageStrength?.trim() ? trial.dosageStrength : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        onSelectTrial(trial)
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <span className="font-mono text-[12px] text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <PaginationBtn onClick={() => setPage(0)} disabled={page === 0}>
              <ChevronsLeft className="h-3 w-3" />
            </PaginationBtn>
            <PaginationBtn onClick={() => setPage(p => p - 1)} disabled={page === 0}>
              <ChevronLeft className="h-3 w-3" />
            </PaginationBtn>
            <PaginationBtn onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
              <ChevronRight className="h-3 w-3" />
            </PaginationBtn>
            <PaginationBtn onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>
              <ChevronsRight className="h-3 w-3" />
            </PaginationBtn>
          </div>
        </div>
      )}
    </div>
  )
}

function PaginationBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 border border-border hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  )
}
