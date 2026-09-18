"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const SLIDES = 2
const INTERVAL = 5000

type CoverageArea = {
  title: string
  medium: string
  description: string
  span: string
  accent: string
  accentLight: string
  type?: "graph" | "bargraph"
}

const coverageAreas: CoverageArea[] = [
  {
    title: "Oncology",
    medium: "Largest Segment",
    description: "Leukemia, lymphoma, melanoma, and solid tumors — spanning checkpoint inhibitors, ADCs, and CAR-T therapies.",
    span: "col-span-2 row-span-2",
    accent: "#1B4965",
    accentLight: "rgba(27, 73, 101, 0.06)",
  },
  {
    title: "Technology Mix",
    medium: "Sample Distribution",
    description: "Illustrative spread of biologic modalities across tracked trials — actual counts withheld.",
    span: "col-span-1 row-span-1",
    accent: "#1E6080",
    accentLight: "rgba(30, 96, 128, 0.05)",
    type: "bargraph",
  },
  {
    title: "Immunology",
    medium: "Autoimmune & Inflammation",
    description: "Monoclonal antibodies and biologics targeting rheumatoid arthritis, lupus, and inflammatory bowel disease.",
    span: "col-span-1 row-span-1",
    accent: "#1E6080",
    accentLight: "rgba(30, 96, 128, 0.06)",
  },
  {
    title: "Rare Disease",
    medium: "Orphan Biologics",
    description: "Gene therapies and enzyme replacements for rare genetic conditions with small patient populations.",
    span: "col-span-1 row-span-1",
    accent: "#2A8F9C",
    accentLight: "rgba(42, 143, 156, 0.06)",
  },
  {
    title: "Trial Phases",
    medium: "Sample Distribution",
    description: "Illustrative breakdown of ongoing biologic trials by phase — actual values withheld.",
    span: "col-span-1 row-span-1",
    accent: "#3AAFA9",
    accentLight: "rgba(58, 175, 169, 0.06)",
    type: "graph",
  },
  {
    title: "Biosimilars",
    medium: "Market Access",
    description: "Follow-on biologics entering the US market — tracking approval timelines, pricing, and competitive dynamics.",
    span: "col-span-2 row-span-1",
    accent: "#4FBDBA",
    accentLight: "rgba(79, 189, 186, 0.06)",
  },
  {
    title: "Vaccines",
    medium: "Preventive Biologics",
    description: "mRNA, viral vector, and recombinant protein vaccine platforms across infectious disease trials.",
    span: "col-span-1 row-span-1",
    accent: "#1E6080",
    accentLight: "rgba(30, 96, 128, 0.06)",
  },
  {
    title: "Neurology",
    medium: "CNS Biologics",
    description: "Emerging biologics for multiple sclerosis, Alzheimer's, and neurodegenerative conditions.",
    span: "col-span-1 row-span-1",
    accent: "#3AAFA9",
    accentLight: "rgba(58, 175, 169, 0.06)",
  },
]

const slideHeadings = [
  {
    label: "02 / Coverage",
    title: "THERAPEUTIC AREAS",
    description: "Coverage across oncology, immunology, rare disease, and emerging biologic platforms.",
  },
  {
    label: "02 / Insights",
    title: "TRIAL ANALYTICS",
    description: "Historical trajectory of trial starts and enrollment distribution across clinical phases.",
  },
]

export function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [slide, setSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !gridRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { x: -60, opacity: 0 }, {
        x: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: headerRef.current, start: "top 90%", toggleActions: "play none none reverse" },
      })
      const cards = gridRef.current?.querySelectorAll("article")
      if (cards && cards.length > 0) {
        gsap.set(cards, { y: 60, opacity: 0 })
        gsap.to(cards, {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 90%", toggleActions: "play none none reverse" },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // Auto-advance
  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => setSlide(s => (s + 1) % SLIDES), INTERVAL)
    return () => clearInterval(id)
  }, [isPaused, SLIDES])

  return (
    <section ref={sectionRef} id="coverage" className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-12 xl:px-20">
      <div ref={headerRef} className="mb-10 md:mb-16">
        <span key={`label-${slide}`} className="font-mono text-sm uppercase tracking-[0.3em] transition-opacity duration-500" style={{ color: "#1B4965" }}>
          {slideHeadings[slide].label}
        </span>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-6">
          <h2 key={`title-${slide}`} className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight transition-opacity duration-500" style={{ color: "#1E6080" }}>
            {slideHeadings[slide].title}
          </h2>
          <p key={`desc-${slide}`} className="max-w-xs font-mono text-xs text-left leading-relaxed transition-opacity duration-500 sm:pb-1" style={{ color: "#1B4965" }}>
            {slideHeadings[slide].description}
          </p>
        </div>
      </div>
      <CoverageCarousel
        gridRef={gridRef}
        slide={slide}
        setSlide={setSlide}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        slides={SLIDES}
      />
    </section>
  )
}

function CoverageCarousel({
  gridRef,
  slide,
  setSlide,
  isPaused,
  setIsPaused,
  slides,
}: {
  gridRef: React.RefObject<HTMLDivElement | null>
  slide: number
  setSlide: React.Dispatch<React.SetStateAction<number>>
  isPaused: boolean
  setIsPaused: (v: boolean) => void
  slides: number
}) {
  const goNext = useCallback(() => setSlide(s => (s + 1) % slides), [setSlide, slides])
  const goPrev = useCallback(() => setSlide(s => (s - 1 + slides) % slides), [setSlide, slides])
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleManual = (fn: () => void) => {
    fn()
    setIsPaused(true)
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), 8000)
  }

  useEffect(() => () => { if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current) }, [])

  return (
    <div className="relative">
      {/* Auto-advance progress bar */}
      <div className="h-[2px] mb-4 overflow-hidden rounded-full" style={{ background: "rgba(30,96,128,0.12)" }}>
        {!isPaused && (
          <div
            key={`${slide}-progress`}
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(to right, #1B4965, #2A8F9C)",
              animation: "slideProgress 5s linear forwards",
            }}
          />
        )}
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          {/* Slide 1 — therapeutic areas grid */}
          <div className="w-full shrink-0">
            <div
              ref={gridRef}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 auto-rows-[160px] sm:auto-rows-[180px] md:auto-rows-[200px]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {coverageAreas.map((area, index) =>
                area.type === "graph" ? (
                  <GraphSnippetCard key={area.title} area={area} index={index} />
                ) : area.type === "bargraph" ? (
                  <BarGraphSnippetCard key={area.title} area={area} index={index} />
                ) : (
                  <CoverageCard key={area.title} area={area} index={index} persistHover={index === 0} />
                ),
              )}
            </div>
          </div>

          {/* Slide 2 — 4 analytics charts */}
          <div
            className="w-full shrink-0"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <TrialsOverTimeCard />
              <EnrollmentByPhaseCard />
              <TopIndicationsCard />
              <TrialsByCountryDoughnutCard />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-center gap-3 sm:gap-5">
        <button
          type="button"
          onClick={() => handleManual(goPrev)}
          aria-label="Previous slide"
          className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-md border border-[#1E6080]/40 bg-background/80 text-[#1E6080] shadow-sm transition hover:border-[#1E6080] hover:bg-[#1E6080]/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: slides }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleManual(() => setSlide(i))}
              aria-label={slide === i ? `Slide ${i + 1} (current)` : `Go to slide ${i + 1}`}
              className="h-[2px] transition-all duration-300"
              style={{
                width: slide === i ? 40 : 18,
                background: slide === i ? "#1E6080" : "rgba(30, 96, 128, 0.25)",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => handleManual(goNext)}
          aria-label="Next slide"
          className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-md border border-[#1E6080]/40 bg-background/80 text-[#1E6080] shadow-sm transition hover:border-[#1E6080] hover:bg-[#1E6080]/10"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <p className="text-center mt-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: "#3AAFA9" }}>
          ⏸ Paused
        </p>
      )}
    </div>
  )
}

function TrialsOverTimeCard() {
  const accent = "#4FBDBA"
  // Illustrative yearly counts matching reference curve shape
  const data = [
    { year: 1997, v: 4 }, { year: 1998, v: 6 }, { year: 1999, v: 10 },
    { year: 2000, v: 14 }, { year: 2001, v: 22 }, { year: 2002, v: 28 },
    { year: 2003, v: 38 }, { year: 2004, v: 52 }, { year: 2005, v: 68 },
    { year: 2006, v: 95 }, { year: 2007, v: 82 }, { year: 2008, v: 80 },
    { year: 2009, v: 92 }, { year: 2010, v: 100 }, { year: 2011, v: 120 },
    { year: 2012, v: 150 }, { year: 2013, v: 180 }, { year: 2014, v: 210 },
    { year: 2015, v: 235 }, { year: 2016, v: 250 }, { year: 2017, v: 255 },
    { year: 2018, v: 258 }, { year: 2019, v: 255 }, { year: 2020, v: 240 },
    { year: 2021, v: 215 }, { year: 2022, v: 160 }, { year: 2023, v: 95 },
    { year: 2024, v: 60 }, { year: 2025, v: 40 }, { year: 2026, v: 18 }, { year: 2027, v: 4 },
  ]
  const w = 420
  const h = 220
  const pad = { l: 36, r: 12, t: 12, b: 26 }
  const iw = w - pad.l - pad.r
  const ih = h - pad.t - pad.b
  const maxV = 260
  const minY = 1997
  const maxY = 2027
  const x = (year: number) => pad.l + ((year - minY) / (maxY - minY)) * iw
  const y = (v: number) => pad.t + ih - (v / maxV) * ih

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(d.year)},${y(d.v)}`).join(" ")
  const area = `${line} L${x(maxY)},${pad.t + ih} L${pad.l},${pad.t + ih} Z`

  return (
    <article
      className="relative border p-5 overflow-hidden"
      style={{ borderColor: "rgba(192, 212, 220, 0.4)", background: "rgba(79, 189, 186, 0.04)", minHeight: 360 }}
    >
      <div className="absolute top-0 left-0 h-[2px] w-full" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>
        Trajectory
      </span>
      <h3 className="mt-1 font-[var(--font-bebas)] text-2xl md:text-3xl tracking-tight" style={{ color: accent }}>
        Trials Started Over Time
      </h3>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full mt-4">
        {/* y gridlines */}
        {[0, 65, 130, 195, 260].map(v => (
          <g key={v}>
            <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="rgba(192,212,220,0.35)" strokeDasharray="2 3" />
            <text x={pad.l - 6} y={y(v) + 3} textAnchor="end" fontSize="9" fill="#2A8F9C" fontFamily="monospace">{v}</text>
          </g>
        ))}
        {/* x labels */}
        {[1997, 2000, 2003, 2006, 2009, 2012, 2015, 2018, 2021, 2024, 2027].map(yr => (
          <text key={yr} x={x(yr)} y={h - 8} textAnchor="middle" fontSize="9" fill="#2A8F9C" fontFamily="monospace">{yr}</text>
        ))}
        <path d={area} fill={`${accent}22`} />
        <path d={line} fill="none" stroke={accent} strokeWidth="1.8" />
        <circle cx={x(2009)} cy={y(92)} r="3" fill={accent} />
        <line x1={x(2009)} x2={x(2009)} y1={pad.t} y2={pad.t + ih} stroke={accent} strokeOpacity="0.3" />
      </svg>

      <p className="mt-2 font-mono text-[10px]" style={{ color: "#2A8F9C" }}>
        Highlight — 2009 · count: 92
      </p>
    </article>
  )
}

function EnrollmentByPhaseCard() {
  const accent = "#4FBDBA"
  const bars = [
    { label: "Phase 3", value: 520000 },
    { label: "Phase 2", value: 75699 },
    { label: "Phase 1", value: 68000 },
    { label: "Phase 1 / Phase 2", value: 22000 },
    { label: "Unknown", value: 14000 },
    { label: "Phase 4", value: 9000 },
    { label: "Phase 2 / Phase 3", value: 3500 },
    { label: "Early Phase 1", value: 1800 },
  ]
  const w = 420
  const h = 220
  const pad = { l: 52, r: 12, t: 12, b: 44 }
  const iw = w - pad.l - pad.r
  const ih = h - pad.t - pad.b
  const maxV = 600000
  const bw = iw / bars.length
  const y = (v: number) => pad.t + ih - (v / maxV) * ih

  return (
    <article
      className="relative border p-5 overflow-hidden"
      style={{ borderColor: "rgba(192, 212, 220, 0.4)", background: "rgba(79, 189, 186, 0.04)", minHeight: 360 }}
    >
      <div className="absolute top-0 left-0 h-[2px] w-full" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>
        Enrollment
      </span>
      <h3 className="mt-1 font-[var(--font-bebas)] text-2xl md:text-3xl tracking-tight" style={{ color: accent }}>
        Participants by Phase
      </h3>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full mt-4">
        {[0, 150000, 300000, 450000, 600000].map(v => (
          <g key={v}>
            <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="rgba(192,212,220,0.35)" strokeDasharray="2 3" />
            <text x={pad.l - 6} y={y(v) + 3} textAnchor="end" fontSize="9" fill="#2A8F9C" fontFamily="monospace">
              {v.toLocaleString()}
            </text>
          </g>
        ))}
        {bars.map((b, i) => {
          const bx = pad.l + i * bw + bw * 0.15
          const barW = bw * 0.7
          const by = y(b.value)
          const bh = pad.t + ih - by
          const isHighlight = b.label === "Phase 2"
          return (
            <g key={b.label}>
              <rect x={bx} y={by} width={barW} height={bh} fill={isHighlight ? "rgba(192,212,220,0.6)" : accent} />
              <text
                x={bx + barW / 2}
                y={h - 20}
                textAnchor="end"
                fontSize="8"
                fill="#2A8F9C"
                fontFamily="monospace"
                transform={`rotate(-30 ${bx + barW / 2} ${h - 20})`}
              >
                {b.label}
              </text>
            </g>
          )
        })}
      </svg>

      <p className="mt-2 font-mono text-[10px]" style={{ color: "#2A8F9C" }}>
        Highlight — Phase 2 · value: 75,699
      </p>
    </article>
  )
}

function TopIndicationsCard() {
  const accent = "#3AAFA9"
  const bars = [
    { label: "Oncology", value: 1420, pct: 100 },
    { label: "Immunology", value: 640, pct: 45 },
    { label: "Neurology", value: 410, pct: 29 },
    { label: "Rare Disease", value: 310, pct: 22 },
    { label: "Cardiovascular", value: 265, pct: 19 },
    { label: "Infectious Dis.", value: 210, pct: 15 },
  ]
  return (
    <article
      className="relative border p-5 overflow-hidden"
      style={{ borderColor: "rgba(192, 212, 220, 0.4)", background: "rgba(58, 175, 169, 0.04)", minHeight: 280 }}
    >
      <div className="absolute top-0 left-0 h-[2px] w-full" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>Indications</span>
      <h3 className="mt-1 font-[var(--font-bebas)] text-2xl md:text-3xl tracking-tight" style={{ color: accent }}>
        Top Therapeutic Areas
      </h3>
      <div className="mt-4 space-y-2.5">
        {bars.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="font-mono text-[9px] w-16 sm:w-24 shrink-0 text-right" style={{ color: "#1B4965" }}>{b.label}</span>
            <div className="flex-1 h-2 rounded-sm overflow-hidden" style={{ background: "rgba(192,212,220,0.25)" }}>
              <div
                className="h-full rounded-sm"
                style={{
                  width: `${b.pct}%`,
                  background: `linear-gradient(to right, #1B4965, ${accent})`,
                }}
              />
            </div>
            <span className="font-mono text-[9px] w-10 shrink-0" style={{ color: "#1B4965" }}>{b.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[9px] opacity-60" style={{ color: "#1B4965" }}>Illustrative · trial counts by indication</p>
    </article>
  )
}

function TrialsByCountryDoughnutCard() {
  const accent = "#1E6080"
  const data = [
    { label: "US",        value: 18200, color: "#1B4965" },
    { label: "UK",        value: 4100,  color: "#1E6080" },
    { label: "India",     value: 3900,  color: "#2A8F9C" },
    { label: "Australia", value: 2800,  color: "#3AAFA9" },
    { label: "Germany",   value: 2400,  color: "#4FBDBA" },
    { label: "France",    value: 1900,  color: "#5ECFCC" },
    { label: "Others",    value: 6900,  color: "rgba(27,73,101,0.35)" },
  ]
  const total = data.reduce((s, d) => s + d.value, 0)

  // SVG donut via stroke-dasharray on a circle
  const R = 54       // donut radius
  const cx = 80
  const cy = 80
  const circ = 2 * Math.PI * R
  const gap = 1.5    // small gap between segments in px of arc
  let cumulativePct = 0

  const segments = data.map((d) => {
    const pct = d.value / total
    const dashLen = Math.max(0, pct * circ - gap)
    const dashOffset = -(cumulativePct * circ)
    cumulativePct += pct
    return { ...d, dashLen, dashOffset, pct }
  })

  return (
    <article
      className="relative border p-5 overflow-hidden"
      style={{ borderColor: "rgba(192, 212, 220, 0.4)", background: "rgba(30, 96, 128, 0.04)", minHeight: 280 }}
    >
      <div className="absolute top-0 left-0 h-[2px] w-full" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>Geography</span>
      <h3 className="mt-1 font-[var(--font-bebas)] text-2xl md:text-3xl tracking-tight" style={{ color: accent }}>
        Trials by Country
      </h3>

      <div className="mt-4 flex items-center gap-5">
        {/* Donut */}
        <svg viewBox="0 0 160 160" className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] shrink-0 -rotate-90">
          {/* Track */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(192,212,220,0.2)" strokeWidth="20" />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="20"
              strokeDasharray={`${s.dashLen} ${circ - s.dashLen}`}
              strokeDashoffset={s.dashOffset}
            />
          ))}
          {/* Centre label — rotate back to read correctly */}
          <text
            x={cx} y={cy - 6}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="#1B4965"
            fontFamily="monospace"
            transform={`rotate(90 ${cx} ${cy})`}
          >
            {(total / 1000).toFixed(0)}K
          </text>
          <text
            x={cx} y={cy + 9}
            textAnchor="middle"
            fontSize="7"
            fill="#1B4965"
            fontFamily="monospace"
            opacity="0.6"
            transform={`rotate(90 ${cx} ${cy})`}
          >
            TRIALS
          </text>
        </svg>

        {/* Legend */}
        <div className="flex flex-col gap-1.5 font-mono text-[9px] min-w-0">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 shrink-0 rounded-sm" style={{ background: d.color }} />
              <span className="truncate" style={{ color: "#1B4965" }}>{d.label}</span>
              <span className="ml-auto pl-2 tabular-nums opacity-70" style={{ color: "#1B4965" }}>
                {Math.round(d.value / total * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 font-mono text-[9px] opacity-60" style={{ color: "#1B4965" }}>
        Total: {total.toLocaleString()} · Illustrative sample
      </p>
    </article>
  )
}

function CoverageCard({
  area,
  index,
  persistHover = false,
}: {
  area: {
    title: string
    medium: string
    description: string
    span: string
    accent: string
    accentLight: string
  }
  index: number
  persistHover?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  const [isScrollActive, setIsScrollActive] = useState(false)

  useEffect(() => {
    if (!persistHover || !cardRef.current) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: cardRef.current,
        start: "top 80%",
        onEnter: () => setIsScrollActive(true),
      })
    }, cardRef)

    return () => ctx.revert()
  }, [persistHover])

  const isActive = isHovered || isScrollActive

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative border p-5 flex flex-col transition-all duration-500 cursor-pointer overflow-hidden",
        area.span,
      )}
      style={{
        borderColor: isActive ? area.accent : "rgba(192, 212, 220, 0.4)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 h-[2px] transition-all duration-500"
        style={{
          width: isActive ? "100%" : "0%",
          background: `linear-gradient(to right, ${area.accent}, transparent)`,
        }}
      />


      {/* Eyebrow + title */}
      <div
        className="relative z-10 transition-opacity duration-400"
        style={{ opacity: isActive ? 0 : 1 }}
      >
        <span
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: "#1B4965" }}
        >
          {area.medium}
        </span>
        <h3
          className="mt-2 font-[var(--font-bebas)] text-2xl md:text-4xl tracking-tight"
          style={{ color: "#0c1b24" }}
        >
          {area.title}
        </h3>
      </div>

      <span
        className="absolute bottom-4 right-4 font-mono text-[10px] transition-colors duration-300"
        style={{ color: isActive ? area.accent : "rgba(61, 96, 112, 0.4)" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Corner accent */}
      <div
        className={cn(
          "absolute top-0 right-0 w-12 h-12 transition-all duration-500",
          isActive ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="absolute top-0 right-0 w-full h-[1px]" style={{ background: area.accent }} />
        <div className="absolute top-0 right-0 w-[1px] h-full" style={{ background: area.accent }} />
      </div>

      {/* Hover overlay — fills card */}
      <div
        className="absolute inset-0 z-20 flex flex-col justify-between p-5 transition-all duration-400"
        style={{
          opacity: isActive ? 1 : 0,
          pointerEvents: isActive ? "auto" : "none",
          background: `linear-gradient(160deg, ${area.accent}dd 0%, ${area.accent}bb 50%, ${area.accent}ee 100%)`,
          backdropFilter: isActive ? "blur(10px)" : "none",
          transform: isActive ? "translateY(0)" : "translateY(100%)",
        }}
      >
        {/* Top — eyebrow */}
        <div>
          <span
            className="font-mono text-[10px] uppercase tracking-widest text-white"
            style={{ opacity: 0.7 }}
          >
            {area.medium}
          </span>
        </div>

        {/* Middle — decorative rule */}
        <div
          className="w-10 h-[1px]"
          style={{ background: "rgba(255,255,255,0.4)" }}
        />

        {/* Bottom — title + description */}
        <div>
          <h3
            className="font-[var(--font-bebas)] text-3xl md:text-4xl tracking-tight text-white mb-2"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.25)" }}
          >
            {area.title}
          </h3>
          <p
            className="font-mono text-xs leading-relaxed text-white"
            style={{ opacity: 0.88 }}
          >
            {area.description}
          </p>
        </div>
      </div>
    </article>
  )
}

function GraphSnippetCard({
  area,
  index,
}: {
  area: { title: string; medium: string; description: string; span: string; accent: string; accentLight: string }
  index: number
}) {
  // Illustrative-only donut; values intentionally hidden and shown as "?"
  const segments = [
    { label: "Phase 2", value: 945, color: "#2A8F9C" },
    { label: "Phase 1", value: 820, color: "#3AAFA9" },
    { label: "Phase 3", value: 772, color: "#4FBDBA" },
    { label: "Phase 1 / Phase 2", value: 310, color: "#1E6080" },
    { label: "Unknown", value: 145, color: "#5ecfcc" },
    { label: "Phase 4", value: 96, color: "#1B4965" },
    { label: "Early Phase 1", value: 74, color: "#3AAFA9" },
    { label: "Phase 2 / Phase 3", value: 38, color: "#4FBDBA" },
  ]
  const total = segments.reduce((a, s) => a + s.value, 0)
  const radius = 32
  const cx = 50
  const cy = 50
  const circ = 2 * Math.PI * radius
  let offset = 0

  return (
    <article
      className={cn(
        "group relative border p-5 flex flex-col justify-between overflow-hidden",
        area.span,
      )}
      style={{ borderColor: "rgba(192, 212, 220, 0.4)", background: area.accentLight }}
    >
      <div className="absolute top-0 left-0 h-[2px] w-full" style={{ background: `linear-gradient(to right, ${area.accent}, transparent)` }} />

      <div className="relative z-10">
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: area.accent }}>
          {area.medium}
        </span>
        <h3 className="mt-1 font-[var(--font-bebas)] text-xl md:text-2xl tracking-tight" style={{ color: area.accent }}>
          {area.title}
        </h3>
      </div>

      <div className="relative z-10 flex items-center justify-center flex-1 -mt-2">
        <svg viewBox="0 0 100 100" className="w-[92px] h-[92px] -rotate-90">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(192,212,220,0.25)" strokeWidth="14" />
          {segments.map((s, i) => {
            const len = (s.value / total) * circ
            const el = (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-offset}
              />
            )
            offset += len
            return el
          })}
        </svg>
        <div className="ml-2 flex flex-col gap-[2px] font-mono text-[8px]" style={{ color: "#1B4965" }}>
          {segments.slice(0, 4).map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5" style={{ background: s.color }} />
              <span className="truncate max-w-[60px]">{s.label}</span>
              <span className="opacity-80">{s.value}</span>
            </div>
          ))}
          <span className="opacity-50">+ more</span>
        </div>
      </div>

      <p className="relative z-10 font-mono text-[9px] leading-snug opacity-70" style={{ color: "#1B4965" }}>
        Illustrative sample
      </p>

      <span className="absolute bottom-4 right-4 font-mono text-[10px]" style={{ color: area.accent }}>
        {String(index + 1).padStart(2, "0")}
      </span>
    </article>
  )
}

function BarGraphSnippetCard({
  area,
  index,
}: {
  area: { title: string; medium: string; description: string; span: string; accent: string; accentLight: string }
  index: number
}) {
  // Illustrative-only bar chart; values intentionally hidden as "?"
  const bars = [
    { label: "Monoclonal Ab", value: 1851, color: "#2A8F9C" },
    { label: "Not Specified", value: 380, color: "#3AAFA9" },
    { label: "Checkpoint Inh.", value: 178, color: "#4FBDBA" },
    { label: "Stem Cell", value: 152, color: "#1E6080" },
    { label: "Immunotherapy", value: 124, color: "#5ecfcc" },
  ]
  const max = Math.max(...bars.map(b => b.value))

  return (
    <article
      className={cn(
        "group relative border p-5 flex flex-col overflow-hidden",
        area.span,
      )}
      style={{ borderColor: "rgba(192, 212, 220, 0.4)", background: area.accentLight }}
    >
      <div
        className="absolute top-0 left-0 h-[2px] w-full"
        style={{ background: `linear-gradient(to right, ${area.accent}, transparent)` }}
      />

      <div className="relative z-10">
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: area.accent }}>
          {area.medium}
        </span>
        <h3 className="mt-1 font-[var(--font-bebas)] text-xl md:text-2xl tracking-tight" style={{ color: area.accent }}>
          {area.title}
        </h3>
      </div>

      <div className="relative z-10 mt-2 flex-1 flex flex-col justify-center gap-[3px]">
        {bars.map((b, i) => (
          <div key={i} className="flex items-center gap-1 font-mono text-[8px]" style={{ color: "#2A8F9C" }}>
            <span className="w-[62px] text-right truncate shrink-0">{b.label}</span>
            <div className="flex-1 h-1.5 bg-[rgba(192,212,220,0.3)] relative">
              <div
                className="h-full"
                style={{ width: `${(b.value / max) * 100}%`, background: b.color }}
              />
            </div>
            <span className="w-8 text-left opacity-80">{b.value}</span>
          </div>
        ))}
      </div>

      <p className="relative z-10 mt-2 font-mono text-[9px] leading-snug opacity-70" style={{ color: "#1B4965" }}>
        Illustrative sample
      </p>

      <span className="absolute bottom-4 right-4 font-mono text-[10px]" style={{ color: area.accent }}>
        {String(index + 1).padStart(2, "0")}
      </span>
    </article>
  )
}

