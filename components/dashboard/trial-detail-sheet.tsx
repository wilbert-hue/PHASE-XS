"use client"

import type { Trial } from "@/app/dashboard/trial-types"
import { normalizePhase, parseDrugPriceNumber } from "@/app/dashboard/trial-types"
import type { DashboardRegion } from "@/lib/dashboard-region"
import { getRegionProfile, isMeaningfulTrialValue } from "@/lib/dashboard-region-profile"
import { normalizeCtriId } from "@/lib/ctri-id"
import {
  X,
  FlaskConical,
  Users,
  Calendar,
  Activity,
  Pill,
  Target,
  DollarSign,
  MapPin,
  Clock,
  TrendingUp,
  Beaker,
  Stethoscope,
  Building2,
  LineChart,
  FileText,
  Download,
} from "lucide-react"
import { createContext, useCallback, useContext, useEffect, useState } from "react"

const SectionAccentContext = createContext<string | null>(null)

function isFieldValueEmpty(value: React.ReactNode): boolean {
  if (value == null) return true
  if (value === "—") return true
  if (typeof value === "string" && !isMeaningfulTrialValue(value)) return true
  return false
}

interface TrialDetailSheetProps {
  trial: Trial | null
  region: DashboardRegion
  onClose: () => void
}

function Field({
  label,
  value,
  showIfEmpty = true,
}: {
  label: string
  value: React.ReactNode
  showIfEmpty?: boolean
}) {
  const accent = useContext(SectionAccentContext)
  const empty = isFieldValueEmpty(value)
  if (empty && !showIfEmpty) return null
  const display = empty ? <span className="text-muted-foreground">N/A</span> : value
  return (
    <div
      className="py-2.5 pl-3 -ml-0.5 border-l-2 rounded-r-sm"
      style={{
        borderColor: accent ? `${accent}40` : "transparent",
        background: accent ? `linear-gradient(90deg, ${accent}0d, transparent 85%)` : undefined,
      }}
    >
      <dt
        className="font-mono text-[11px] uppercase tracking-widest mb-1 w-fit rounded px-1.5 py-0.5 -ml-0.5"
        style={
          accent
            ? { color: accent, background: `${accent}18` }
            : { color: "hsl(var(--muted-foreground))" }
        }
      >
        {label}
      </dt>
      <dd className="font-mono text-sm leading-relaxed text-foreground/90 pl-0.5">{display}</dd>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <SectionAccentContext.Provider value={accent}>
      <div
        className="relative rounded-lg border overflow-hidden"
        style={{
          borderColor: `${accent}35`,
          background: `linear-gradient(135deg, ${accent}12 0%, ${accent}04 40%, transparent 70%)`,
          boxShadow: `inset 0 1px 0 ${accent}20`,
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${accent} 0%, ${accent}99 40%, ${accent}33 100%)` }}
        />
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 mt-0.5">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-md shadow-sm"
            style={{ background: `linear-gradient(145deg, ${accent}2e, ${accent}14)`, color: accent }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <h3
            className="font-[var(--font-bebas)] text-lg tracking-widest"
            style={{ color: accent, textShadow: `0 0 24px ${accent}30` }}
          >
            {title}
          </h3>
        </div>
        <div className="px-4 pb-3 pt-0.5 divide-y divide-border/30">{children}</div>
      </div>
    </SectionAccentContext.Provider>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  accent: string
}) {
  return (
    <div
      className="relative rounded-lg border border-border/60 p-3 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${accent}14 0%, transparent 100%)`,
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-[2px]"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />
      <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
        <span style={{ color: accent }}>
          <Icon className="h-3 w-3" />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-widest">{label}</span>
      </div>
      <div className="font-[var(--font-bebas)] text-3xl tracking-wide leading-none" style={{ color: accent }}>
        {value}
      </div>
    </div>
  )
}

function EndpointList({ text, accent }: { text: string; accent: string }) {
  const items = text.split(/\s*\|\|\s*|\n+/).filter(s => isMeaningfulTrialValue(s))
  if (items.length === 0) return null
  return (
    <ul className="space-y-1">
      {items.slice(0, 12).map((ep, i) => (
        <li key={i} className="flex gap-2 text-sm">
          <span style={{ color: accent }}>▸</span>
          <span>{ep.trim()}</span>
        </li>
      ))}
    </ul>
  )
}

function UsTrialBody({ trial, showEmpty }: { trial: Trial; showEmpty: boolean }) {
  const priceNum = parseDrugPriceNumber(trial.drugPrice)
  const C = {
    kpiEnroll: "#2563EB",
    kpiDuration: "#C2410C",
    kpiArms: "#7C3AED",
    kpiAdherence: "#0D9488",
    therapeutic: "#1B4965",
    market: "#6D28D9",
    trialDesign: "#B45309",
    timeline: "#0E7490",
    outcomes: "#BE123C",
    pricing: "#047857",
    sponsor: "#4338CA",
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {trial.enrollment ? (
          <KpiCard
            icon={Users}
            label="Enrollment"
            value={
              trial.enrollment >= 1000
                ? `${(trial.enrollment / 1000).toFixed(1)}K`
                : trial.enrollment.toLocaleString()
            }
            accent={C.kpiEnroll}
          />
        ) : null}
        {trial.durationYears ? (
          <KpiCard icon={Clock} label="Duration" value={`${trial.durationYears}y`} accent={C.kpiDuration} />
        ) : null}
        {trial.arms ? (
          <KpiCard icon={FlaskConical} label="Arms" value={String(trial.arms)} accent={C.kpiArms} />
        ) : null}
        {trial.adherenceRate != null ? (
          <KpiCard
            icon={TrendingUp}
            label="Adherence"
            value={`${trial.adherenceRate}%`}
            accent={C.kpiAdherence}
          />
        ) : null}
      </div>

      <Section icon={Stethoscope} title="Therapeutic Profile" accent={C.therapeutic}>
        <Field label="Approved Biologics" value={trial.approvedBiologics} showIfEmpty={showEmpty} />
        <Field
          label="Indication"
          value={
            trial.indication
              ? trial.indication.charAt(0) + trial.indication.slice(1).toLowerCase()
              : null
          }
          showIfEmpty={showEmpty}
        />
        <Field label="Disease Condition" value={trial.diseaseCondition} showIfEmpty={showEmpty} />
        <Field label="Pharmacological Class" value={trial.pharmClass} showIfEmpty={showEmpty} />
      </Section>

      <Section icon={LineChart} title="Market Forecast" accent={C.market}>
        <Field label="2023 (US$ Mn)" value={trial.marketForecast2023} showIfEmpty={showEmpty} />
        <Field label="2024 (US$ Mn)" value={trial.marketForecast2024} showIfEmpty={showEmpty} />
        <Field label="2025 (US$ Mn)" value={trial.marketForecast2025} showIfEmpty={showEmpty} />
        <Field label="2026 (US$ Mn)" value={trial.marketForecast2026} showIfEmpty={showEmpty} />
        <Field label="2027 (US$ Mn)" value={trial.marketForecast2027} showIfEmpty={showEmpty} />
      </Section>

      <Section icon={Beaker} title="Trial Design & Dosing" accent={C.trialDesign}>
        <Field label="Trial Design" value={trial.trialDesign} showIfEmpty={showEmpty} />
        <Field label="Route of Administration" value={trial.routeOfAdmin} showIfEmpty={showEmpty} />
        <Field label="Administration Type" value={trial.adminType} showIfEmpty={showEmpty} />
        <Field label="Age Group" value={trial.age} showIfEmpty={showEmpty} />
        <Field label="Dosage / Strength" value={trial.dosageStrength} showIfEmpty={showEmpty} />
        <Field label="Dosing Frequency" value={trial.dosingFrequency} showIfEmpty={showEmpty} />
      </Section>

      <Section icon={Calendar} title="Dates & Timeline" accent={C.timeline}>
        <Field label="Study Start" value={trial.startDate} showIfEmpty={showEmpty} />
        <Field label="Primary Completion" value={trial.primaryCompletionDate} showIfEmpty={showEmpty} />
        <Field label="Study Completion" value={trial.completionDate} showIfEmpty={showEmpty} />
        <Field label="Est. Launch Date" value={trial.estLaunchDate} showIfEmpty={showEmpty} />
        <Field label="Approval Year" value={trial.approvalYear} showIfEmpty={showEmpty} />
      </Section>

      <Section icon={Target} title="Outcomes & Endpoints" accent={C.outcomes}>
        <Field label="Primary End Point" value={trial.primaryEndPoint} showIfEmpty={showEmpty} />
        <Field
          label="Est. Incidence (2025)"
          value={trial.incidence2025 != null ? trial.incidence2025.toLocaleString() : null}
          showIfEmpty={showEmpty}
        />
        <Field
          label="Endpoints"
          value={trial.endpoints ? <EndpointList text={trial.endpoints} accent={C.outcomes} /> : null}
          showIfEmpty={showEmpty}
        />
        <Field label="Adverse effects" value={trial.adverseEffect} showIfEmpty={showEmpty} />
      </Section>

      <Section icon={DollarSign} title="Pricing & Alternatives" accent={C.pricing}>
        <Field
          label="Drug Price"
          value={
            priceNum != null ? (
              <span className="flex items-center gap-2">
                <span className="font-[var(--font-bebas)] text-2xl" style={{ color: C.pricing }}>
                  ${priceNum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-muted-foreground text-[12px]">(listed)</span>
              </span>
            ) : showEmpty
              ? "N/A"
              : null
          }
          showIfEmpty={showEmpty}
        />
        <Field label="Reimbursement" value={trial.reimbursement} showIfEmpty={showEmpty} />
        <Field
          label="Price source URL"
          value={
            trial.drugPriceUrl && /^https?:\/\//i.test(trial.drugPriceUrl.trim()) ? (
              <a
                href={trial.drugPriceUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 break-all"
              >
                {trial.drugPriceUrl.trim()}
              </a>
            ) : trial.drugPriceUrl
              ? trial.drugPriceUrl.trim()
              : null
          }
          showIfEmpty={showEmpty}
        />
        <Field label="Drug/Brand Alternatives" value={trial.drugBrandSwitch} showIfEmpty={showEmpty} />
      </Section>

      <Section icon={Building2} title="Sponsor & Locations" accent={C.sponsor}>
        <Field label="Sponsor" value={trial.sponsor} showIfEmpty={showEmpty} />
        <Field
          label="Other Locations"
          value={
            trial.locationOther ? (
              <span className="inline-flex items-start gap-1.5">
                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <span>{trial.locationOther}</span>
              </span>
            ) : null
          }
          showIfEmpty={showEmpty}
        />
        <Field
          label="No. of Related Trials"
          value={trial.numTrials != null && trial.numTrials > 0 ? String(trial.numTrials) : null}
          showIfEmpty={showEmpty}
        />
        <Field label="ATC Code" value={trial.atcCode} showIfEmpty={showEmpty} />
      </Section>
    </>
  )
}

function UkTrialBody({ trial }: { trial: Trial }) {
  const C = {
    kpiEnroll: "#2563EB",
    overview: "#1B4965",
    design: "#B45309",
    timeline: "#0E7490",
    outcomes: "#BE123C",
    sponsor: "#4338CA",
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        {trial.enrollment > 0 ? (
          <KpiCard
            icon={Users}
            label="Target Sample"
            value={trial.enrollment.toLocaleString()}
            accent={C.kpiEnroll}
          />
        ) : null}
      </div>

      <Section icon={FileText} title="Study Overview" accent={C.overview}>
        <Field label="Study Acronym" value={trial.publicTitle} showIfEmpty={false} />
        <Field label="Scientific Title" value={trial.scientificTitle} showIfEmpty={false} />
        <Field label="Primary Objective" value={trial.briefSummary} showIfEmpty={false} />
        <Field label="Health Condition(s)" value={trial.indication} showIfEmpty={false} />
        <Field label="Condition Category" value={trial.diseaseCondition} showIfEmpty={false} />
        <Field label="Purpose" value={trial.pharmClass} showIfEmpty={false} />
      </Section>

      <Section icon={Beaker} title="Design & Intervention" accent={C.design}>
        <Field label="Primary Study Design" value={trial.adminType} showIfEmpty={false} />
        <Field label="Overall Study Status" value={trial.trialDesign} showIfEmpty={false} />
        <Field label="Allocation" value={trial.technology} showIfEmpty={false} />
        <Field label="Assignment" value={trial.routeOfAdmin} showIfEmpty={false} />
        <Field label="Control" value={trial.biologicType} showIfEmpty={false} />
        <Field label="Masking" value={trial.blinding} showIfEmpty={false} />
        <Field label="Age Group" value={trial.age} showIfEmpty={false} />
        <Field label="Intervention" value={trial.dosageStrength} showIfEmpty={false} />
      </Section>

      <Section icon={Calendar} title="Dates" accent={C.timeline}>
        <Field label="Submission Date" value={trial.startDate} showIfEmpty={false} />
        <Field label="Completion Date" value={trial.completionDate} showIfEmpty={false} />
      </Section>

      <Section icon={Target} title="Outcomes" accent={C.outcomes}>
        <Field label="Primary Outcome" value={trial.primaryEndPoint} showIfEmpty={false} />
        <Field
          label="Key Secondary Outcomes"
          value={
            trial.secondaryOutcomes ? (
              <EndpointList text={trial.secondaryOutcomes} accent={C.outcomes} />
            ) : null
          }
          showIfEmpty={false}
        />
      </Section>

      <Section icon={Building2} title="Sponsor & Recruitment" accent={C.sponsor}>
        <Field label="Sponsor" value={trial.sponsor} showIfEmpty={false} />
        <Field label="Recruitment Status" value={trial.recruitmentStatus} showIfEmpty={false} />
        <Field
          label="Countries of Recruitment"
          value={
            trial.locationOther ? (
              <span className="inline-flex items-start gap-1.5">
                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <span>{trial.locationOther}</span>
              </span>
            ) : null
          }
          showIfEmpty={false}
        />
        <Field
          label="ISRCTN Registry"
          value={
            trial.ctriDetailUrl && /^https?:\/\//i.test(trial.ctriDetailUrl.trim()) ? (
              <a
                href={trial.ctriDetailUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 break-all"
              >
                View on ISRCTN
              </a>
            ) : null
          }
          showIfEmpty={false}
        />
      </Section>
    </>
  )
}

function InTrialBody({ trial }: { trial: Trial }) {
  const C = {
    kpiEnroll: "#2563EB",
    kpiDuration: "#C2410C",
    overview: "#1B4965",
    design: "#B45309",
    timeline: "#0E7490",
    outcomes: "#BE123C",
    sponsor: "#4338CA",
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        {trial.enrollment > 0 ? (
          <KpiCard
            icon={Users}
            label="Target Sample"
            value={
              trial.enrollment >= 1000
                ? `${(trial.enrollment / 1000).toFixed(1)}K`
                : trial.enrollment.toLocaleString()
            }
            accent={C.kpiEnroll}
          />
        ) : null}
        {trial.durationYears > 0 ? (
          <KpiCard icon={Clock} label="Est. Duration" value={`${trial.durationYears}y`} accent={C.kpiDuration} />
        ) : null}
      </div>

      <Section icon={FileText} title="Study Overview" accent={C.overview}>
        <Field label="Public Title" value={trial.publicTitle} showIfEmpty={false} />
        <Field label="Scientific Title" value={trial.scientificTitle} showIfEmpty={false} />
        <Field label="Brief Summary" value={trial.briefSummary} showIfEmpty={false} />
        <Field
          label="Condition"
          value={
            trial.indication
              ? trial.indication.charAt(0) + trial.indication.slice(1).toLowerCase()
              : null
          }
          showIfEmpty={false}
        />
        <Field label="Health Type" value={trial.diseaseCondition} showIfEmpty={false} />
        <Field label="Intervention Type" value={trial.pharmClass} showIfEmpty={false} />
      </Section>

      <Section icon={Beaker} title="Study Design & Intervention" accent={C.design}>
        <Field label="Study Design" value={trial.trialDesign} showIfEmpty={false} />
        <Field label="Study Type" value={trial.adminType} showIfEmpty={false} />
        <Field label="Trial Type" value={trial.technology} showIfEmpty={false} />
        <Field label="Age Criteria" value={trial.age} showIfEmpty={false} />
        <Field label="Gender Criteria" value={trial.genderCriteria} showIfEmpty={false} />
        <Field label="Intervention Details" value={trial.dosageStrength} showIfEmpty={false} />
        <Field label="Blinding / Masking" value={trial.blinding} showIfEmpty={false} />
        <Field label="Randomization" value={trial.randomization} showIfEmpty={false} />
      </Section>

      <Section icon={Calendar} title="Dates (India)" accent={C.timeline}>
        <Field label="First Enrollment (India)" value={trial.startDate} showIfEmpty={false} />
        <Field label="Study Completion (India)" value={trial.completionDate} showIfEmpty={false} />
      </Section>

      <Section icon={Target} title="Outcomes" accent={C.outcomes}>
        <Field label="Primary Outcome" value={trial.primaryEndPoint} showIfEmpty={false} />
        <Field
          label="Primary Outcome (detail)"
          value={trial.endpoints ? <EndpointList text={trial.endpoints} accent={C.outcomes} /> : null}
          showIfEmpty={false}
        />
        <Field label="Outcome Timepoints" value={trial.outcomeTimepoints} showIfEmpty={false} />
        <Field
          label="Secondary Outcomes"
          value={
            trial.secondaryOutcomes ? (
              <EndpointList text={trial.secondaryOutcomes} accent={C.outcomes} />
            ) : null
          }
          showIfEmpty={false}
        />
      </Section>

      <Section icon={Building2} title="Sponsor & Recruitment" accent={C.sponsor}>
        <Field label="Primary Sponsor" value={trial.sponsor} showIfEmpty={false} />
        <Field label="Recruitment Status" value={trial.recruitmentStatus} showIfEmpty={false} />
        <Field
          label="Countries of Recruitment"
          value={
            trial.locationOther ? (
              <span className="inline-flex items-start gap-1.5">
                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <span>{trial.locationOther}</span>
              </span>
            ) : null
          }
          showIfEmpty={false}
        />
        <Field
          label="CTRI Registry"
          value={
            trial.ctriDetailUrl && /^https?:\/\//i.test(trial.ctriDetailUrl.trim()) ? (
              <a
                href={trial.ctriDetailUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 break-all"
              >
                View on CTRI
              </a>
            ) : null
          }
          showIfEmpty={false}
        />
      </Section>
    </>
  )
}

async function fetchTrialDetail(nctId: string, region: DashboardRegion): Promise<Trial | null> {
  const res = await fetch(
    `/api/dashboard/trial/${encodeURIComponent(nctId)}?region=${region}`,
    { credentials: "same-origin" },
  )
  if (res.status === 401) {
    window.location.href = "/auth/login?returnTo=/dashboard"
    return null
  }
  if (!res.ok) return null
  return (await res.json()) as Trial
}

export function TrialDetailSheet({ trial, region, onClose }: TrialDetailSheetProps) {
  const profile = getRegionProfile(region)
  const [detail, setDetail] = useState<Trial | null>(trial)
  const [detailLoading, setDetailLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    if (!trial) {
      setDetail(null)
      return
    }
    setDetail(trial)
    let cancelled = false
    setDetailLoading(true)
    void fetchTrialDetail(trial.nctId, region)
      .then(full => {
        if (!cancelled && full) setDetail(full)
      })
      .catch(e => console.error("[trial-detail] fetch failed", e))
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [trial, region])

  const handleDownloadPdf = useCallback(async () => {
    const active = detail ?? trial
    if (!active || pdfLoading) return
    setPdfLoading(true)
    try {
      const fullTrial = detail ?? (await fetchTrialDetail(active.nctId, region))
      if (!fullTrial) throw new Error("Trial fetch failed")
      const { downloadTrialReportPdf } = await import("@/lib/trial-report-pdf")
      await downloadTrialReportPdf(fullTrial, region)
    } catch (e) {
      console.error("[trial-detail] PDF export failed", e)
    } finally {
      setPdfLoading(false)
    }
  }, [detail, trial, region, pdfLoading])

  useEffect(() => {
    if (!trial) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [trial, onClose])

  if (!trial || !detail) return null

  const isIndia = region === "in"
  const isUk = region === "uk"
  const displayId = isIndia ? normalizeCtriId(detail.nctId) : detail.nctId
  const C = { hero1: "#1B4965", hero2: "#1E6080", hero3: "#2A8F9C" }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="fixed inset-y-0 right-0 z-[70] w-full max-w-xl bg-background border-l border-border overflow-y-auto overscroll-contain"
        onWheel={e => e.stopPropagation()}
      >
        <div
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${C.hero1} 0%, ${C.hero2} 50%, ${C.hero3} 100%)`,
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, #fff 0, #fff 1px, transparent 1px, transparent 12px)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(50% 60% at 80% 20%, rgba(79,189,186,0.35), transparent 70%)",
            }}
          />

          <div className="relative px-6 pt-5 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-widest text-white/70">
                  {isIndia ? "CTRI Trial Detail" : isUk ? "ISRCTN Trial Detail" : "Trial Detail"}
                </span>
                <h2 className="font-[var(--font-bebas)] text-4xl tracking-wider text-white mt-0.5">
                  {displayId}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {!isUk ? (
                  <button
                    type="button"
                    onClick={() => void handleDownloadPdf()}
                    disabled={pdfLoading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-white/30 text-white/90 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-60 text-[11px] font-mono uppercase tracking-wider"
                    aria-label="Download PDF report"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {pdfLoading ? "Preparing…" : "PDF"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded border border-white/25 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {detail.molecule && (
              <div className="mb-4">
                <span className="font-mono text-[11px] uppercase tracking-widest text-white/60">
                  {profile.moleculeLabel}
                </span>
                <div className="font-[var(--font-bebas)] text-2xl tracking-wide text-white">
                  {detail.molecule}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/95 text-[#1B4965] px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider font-semibold">
                <Activity className="h-3 w-3" />
                {normalizePhase(detail.phase)}
              </span>
              {isMeaningfulTrialValue(isUk ? detail.adminType : detail.technology) && (
                <span className="rounded-full bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider border border-white/20">
                  <span className="opacity-60 mr-1">
                    {isIndia ? "Type:" : isUk ? "Design:" : "Tech:"}
                  </span>
                  {isUk ? detail.adminType : detail.technology}
                </span>
              )}
              {(isIndia || isUk) && isMeaningfulTrialValue(detail.recruitmentStatus) && (
                <span className="rounded-full bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider border border-white/20">
                  {detail.recruitmentStatus}
                </span>
              )}
              {!isIndia && !isUk && isMeaningfulTrialValue(detail.biologicType) && (
                <span className="rounded-full bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider border border-white/20">
                  <span className="opacity-60 mr-1">Type:</span>
                  {detail.biologicType}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 py-5 space-y-5">
          {detailLoading && (
            <p className="font-mono text-xs text-muted-foreground">Loading full trial record…</p>
          )}
          {isIndia ? (
            <InTrialBody trial={detail} />
          ) : isUk ? (
            <UkTrialBody trial={detail} />
          ) : (
            <UsTrialBody trial={detail} showEmpty={!profile.detailHideEmpty} />
          )}
        </div>
      </div>
    </>
  )
}
