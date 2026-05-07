"use client"

import type { Trial } from "@/app/dashboard/trial-types"
import { normalizePhase, parseDrugPriceNumber } from "@/app/dashboard/trial-types"
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
} from "lucide-react"
import { createContext, useContext, useEffect } from "react"

const SectionAccentContext = createContext<string | null>(null)

function isFieldValueEmpty(value: React.ReactNode): boolean {
  if (value == null) return true
  if (value === "—") return true
  if (typeof value === "string" && value.trim() === "") return true
  return false
}

interface TrialDetailSheetProps {
  trial: Trial | null
  onClose: () => void
}

function Field({
  label,
  value,
  showIfEmpty = true,
}: {
  label: string
  value: React.ReactNode
  /** When true, render the row with "N/A" if there is no value (full column coverage in reports). */
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
        {/* Accent bar */}
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

export function TrialDetailSheet({ trial, onClose }: TrialDetailSheetProps) {
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

  if (!trial) return null

  const priceNum = parseDrugPriceNumber(trial.drugPrice)

  // Per-section palette: distinct hues so blocks read as separate “chapters”
  const C = {
    hero1: "#1B4965",
    hero2: "#1E6080",
    hero3: "#2A8F9C",
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed inset-y-0 right-0 z-[70] w-full max-w-xl bg-background border-l border-border overflow-y-auto overscroll-contain"
        onWheel={e => e.stopPropagation()}
      >
        {/* Hero header with gradient */}
        <div
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${C.hero1} 0%, ${C.hero2} 50%, ${C.hero3} 100%)`,
          }}
        >
          {/* Diagonal texture */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, #fff 0, #fff 1px, transparent 1px, transparent 12px)",
            }}
          />
          {/* Glow */}
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
                  Trial Detail
                </span>
                <h2 className="font-[var(--font-bebas)] text-4xl tracking-wider text-white mt-0.5">
                  {trial.nctId}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded border border-white/25 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Molecule highlight */}
            {trial.molecule && (
              <div className="mb-4">
                <span className="font-mono text-[11px] uppercase tracking-widest text-white/60">
                  Molecule
                </span>
                <div className="font-[var(--font-bebas)] text-2xl tracking-wide text-white">
                  {trial.molecule}
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/95 text-[#1B4965] px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider font-semibold">
                <Activity className="h-3 w-3" />
                {normalizePhase(trial.phase)}
              </span>
              {trial.technology && trial.technology.toLowerCase() !== "not specified" && (
                <span className="rounded-full bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider border border-white/20">
                  <span className="opacity-60 mr-1">Tech:</span>
                  {trial.technology}
                </span>
              )}
              {trial.biologicType && trial.biologicType.toLowerCase() !== "not specified" && (
                <span className="rounded-full bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider border border-white/20">
                  <span className="opacity-60 mr-1">Type:</span>
                  {trial.biologicType}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5">
          {/* KPI row */}
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
              <KpiCard
                icon={Clock}
                label="Duration"
                value={`${trial.durationYears}y`}
                accent={C.kpiDuration}
              />
            ) : null}
            {trial.arms ? (
              <KpiCard
                icon={FlaskConical}
                label="Arms"
                value={String(trial.arms)}
                accent={C.kpiArms}
              />
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

          {/* Therapeutic Profile */}
          <Section icon={Stethoscope} title="Therapeutic Profile" accent={C.therapeutic}>
            <Field label="Approved Biologics" value={trial.approvedBiologics} />
            <Field
              label="Indication"
              value={
                trial.indication
                  ? trial.indication.charAt(0) + trial.indication.slice(1).toLowerCase()
                  : null
              }
            />
            <Field label="Disease Condition" value={trial.diseaseCondition} />
            <Field label="Pharmacological Class" value={trial.pharmClass} />
          </Section>

          {/* Market forecast (US$ Mn) */}
          <Section icon={LineChart} title="Market Forecast" accent={C.market}>
            <Field label="2023 (US$ Mn)" value={trial.marketForecast2023} />
            <Field label="2024 (US$ Mn)" value={trial.marketForecast2024} />
            <Field label="2025 (US$ Mn)" value={trial.marketForecast2025} />
            <Field label="2026 (US$ Mn)" value={trial.marketForecast2026} />
            <Field label="2027 (US$ Mn)" value={trial.marketForecast2027} />
          </Section>

          {/* Trial Design */}
          <Section icon={Beaker} title="Trial Design & Dosing" accent={C.trialDesign}>
            <Field label="Trial Design" value={trial.trialDesign} />
            <Field label="Route of Administration" value={trial.routeOfAdmin} />
            <Field label="Administration Type" value={trial.adminType} />
            <Field label="Age Group" value={trial.age} />
            <Field label="Dosage / Strength" value={trial.dosageStrength} />
            <Field label="Dosing Frequency" value={trial.dosingFrequency} />
          </Section>

          {/* Timeline */}
          <Section icon={Calendar} title="Dates & Timeline" accent={C.timeline}>
            <Field label="Study Start" value={trial.startDate} />
            <Field label="Primary Completion" value={trial.primaryCompletionDate} />
            <Field label="Study Completion" value={trial.completionDate} />
            <Field label="Est. Launch Date" value={trial.estLaunchDate} />
            <Field label="Approval Year" value={trial.approvalYear} />
          </Section>

          {/* Outcomes */}
          <Section icon={Target} title="Outcomes & Endpoints" accent={C.outcomes}>
            <Field label="Primary End Point" value={trial.primaryEndPoint} />
            <Field label="Est. Incidence (2025)" value={
              trial.incidence2025 != null ? trial.incidence2025.toLocaleString() : null
            } />
            <Field
              label="Endpoints"
              value={
                trial.endpoints ? (
                  <ul className="space-y-1">
                    {trial.endpoints
                      .split(" || ")
                      .filter(Boolean)
                      .slice(0, 10)
                      .map((ep, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span style={{ color: C.outcomes }}>▸</span>
                          <span>{ep.trim()}</span>
                        </li>
                      ))}
                  </ul>
                ) : null
              }
            />
            <Field label="Adverse effects" value={trial.adverseEffect} />
          </Section>

          {/* Pricing & access — always shown so pricing / reimbursement / alternatives align with spreadsheet columns */}
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
                ) : (
                  "N/A"
                )
              }
            />
            <Field label="Reimbursement" value={trial.reimbursement} />
            <Field
              label="Price source URL"
              value={
                trial.drugPriceUrl && String(trial.drugPriceUrl).trim() ? (
                  /^https?:\/\//i.test(String(trial.drugPriceUrl).trim()) ? (
                    <a
                      href={String(trial.drugPriceUrl).trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 break-all"
                    >
                      {String(trial.drugPriceUrl).trim()}
                    </a>
                  ) : (
                    String(trial.drugPriceUrl).trim()
                  )
                ) : null
              }
            />
            <Field label="Drug/Brand Alternatives" value={trial.drugBrandSwitch} />
          </Section>

          {/* Sponsor & Meta */}
          <Section icon={Building2} title="Sponsor & Locations" accent={C.sponsor}>
            <Field label="Sponsor" value={trial.sponsor} />
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
            />
            <Field
              label="No. of Related Trials"
              value={trial.numTrials != null ? String(trial.numTrials) : null}
            />
            <Field label="ATC Code" value={trial.atcCode} />
          </Section>
        </div>
      </div>
    </>
  )
}
