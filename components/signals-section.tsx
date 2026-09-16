"use client"

import type { DatasetCoverageStats } from "@/app/dashboard/trial-types"
import { useRef, useState, useEffect } from "react"
import { Database, Layers, Cpu, Globe2, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const SIGNAL_ACCENT = "#0D9488"
const SIGNAL_ACCENT_LIGHT = "rgba(13, 148, 136, 0.1)"

const metrics = [
  {
    date: "Phase 3",
    title: "707K+ Enrolled",
    note: "Total participants enrolled across all tracked trials — the largest segment in late-stage studies.",
    accent: SIGNAL_ACCENT,
    accentLight: SIGNAL_ACCENT_LIGHT,
  },
  {
    date: "Oncology",
    title: "Top Indication",
    note: "Leukemia, lymphoma, and solid tumors dominate the trial landscape with 40%+ of all studies.",
    accent: SIGNAL_ACCENT,
    accentLight: SIGNAL_ACCENT_LIGHT,
  },
  {
    date: "mAb",
    title: "Leading Tech",
    note: "Monoclonal antibodies represent the dominant technology platform across all phases.",
    accent: SIGNAL_ACCENT,
    accentLight: SIGNAL_ACCENT_LIGHT,
  },
  {
    date: "92.3%",
    title: "Adherence Rate",
    note: "Average patient compliance across all tracked trials — a key indicator of protocol feasibility.",
    accent: SIGNAL_ACCENT,
    accentLight: SIGNAL_ACCENT_LIGHT,
  },
]

export function SignalsSection({ coverage }: { coverage: DatasetCoverageStats }) {
  const listRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (!sectionRef.current || !cursorRef.current) return

    const section = sectionRef.current
    const cursor = cursorRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      gsap.to(cursor, {
        x: x,
        y: y,
        duration: 0.5,
        ease: "power3.out",
      })
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    section.addEventListener("mousemove", handleMouseMove)
    section.addEventListener("mouseenter", handleMouseEnter)
    section.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      section.removeEventListener("mousemove", handleMouseMove)
      section.removeEventListener("mouseenter", handleMouseEnter)
      section.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !listRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      )

      const cards = listRef.current?.querySelectorAll("article")
      if (cards) {
        gsap.fromTo(
          cards,
          { x: -100, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: listRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="metrics" ref={sectionRef} className="relative py-32 px-4 sm:px-6 lg:px-12 xl:px-20">
      {/* Cursor — c3 */}
      <div
        ref={cursorRef}
        className={cn(
          "pointer-events-none absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-50",
          "w-5 h-5 rounded-full transition-opacity duration-300",
          isHovering ? "opacity-100" : "opacity-0",
        )}
        style={{ background: "#2A8F9C", border: "1px solid #4FBDBA" }}
      />

      {/* Section header */}
      <div ref={headerRef} className="mb-16">
        {/* Label — c4 */}
        <span
          className="font-mono text-sm uppercase tracking-[0.3em]"
          style={{ color: "#1B4965" }}
        >
          01 / Key Metrics
        </span>
        {/* Heading — c1 */}
        <h2
          className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight"
          style={{ color: "#1B4965" }}
        >
          AT A GLANCE
        </h2>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={listRef}
        className="flex gap-8 overflow-x-auto pb-8 pr-12 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} metric={metric} index={index} />
        ))}
      </div>

      {/* Diagram-style scope block — hub + bracketed lists (see dataset breadth at a glance) */}
      <DatasetScopeDiagram coverage={coverage} />
    </section>
  )
}

function DatasetScopeDiagram({ coverage }: { coverage: DatasetCoverageStats }) {
  const categories: { Icon: LucideIcon; title: string; items: string[] }[] = [
    {
      Icon: Database,
      title: "Coverage",
      items: [
        `${coverage.trials.toLocaleString()}+ Trials`,
        `${coverage.molecules.toLocaleString()}+ Molecules`,
        `${coverage.indications.toLocaleString()}+ Indications`,
      ],
    },
    {
      Icon: Layers,
      title: "Trial Phases",
      items: ["Early Phase 1", "Phase 1 – 4", "Combined Phases"],
    },
    {
      Icon: Cpu,
      title: "Technologies",
      items: ["Monoclonal Antibodies", "CAR-T / Cell Therapy", "ADCs & Biosimilars"],
    },
    {
      Icon: Globe2,
      title: "Regions",
      items: ["17 Countries", "US · UK · IN", "EU · APAC · LATAM"],
    },
  ]

  const heroStats = [
    { value: `${coverage.trials.toLocaleString()}+`, label: "Clinical Trials" },
    { value: `${coverage.molecules.toLocaleString()}+`, label: "Drug Molecules" },
    { value: `${coverage.indications.toLocaleString()}+`, label: "Indications" },
    { value: "17", label: "Countries" },
  ]

  return (
    <div
      className="mt-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0b2030 0%, #0d2840 55%, #07161f 100%)",
        border: "1px solid rgba(79,189,186,0.18)",
      }}
      aria-label="Dataset scope overview"
    >
      {/* Corner ticks */}
      <span className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2" style={{ borderColor: "#4FBDBA" }} />
      <span className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2" style={{ borderColor: "#4FBDBA" }} />
      <span className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2" style={{ borderColor: "#4FBDBA" }} />
      <span className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2" style={{ borderColor: "#4FBDBA" }} />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(79,189,186,1) 1px, transparent 1px), linear-gradient(90deg, rgba(79,189,186,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Header bar */}
      <div
        className="relative flex items-center justify-between px-6 sm:px-8 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4FBDBA] shadow-[0_0_8px_#4FBDBA]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#4FBDBA]">Dataset Scope</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
          Verified · Live Data
        </span>
      </div>

      {/* Hero stats row */}
      <div
        className="relative grid grid-cols-2 sm:grid-cols-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {heroStats.map((stat, i) => (
          <div
            key={stat.label}
            className="px-6 sm:px-8 py-7 sm:py-8"
            style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
          >
            <div
              className="font-[var(--font-bebas)] text-4xl sm:text-5xl leading-none tracking-wide"
              style={{ color: "#ffffff" }}
            >
              {stat.value}
            </div>
            <div
              className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: "rgba(79,189,186,0.7)" }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Category panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat, i) => (
          <div
            key={cat.title}
            className="px-6 sm:px-7 py-7 group transition-colors duration-300 hover:bg-white/[0.03]"
            style={{
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
          >
            {/* Category header */}
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="flex items-center justify-center w-7 h-7 shrink-0"
                style={{
                  background: "rgba(79,189,186,0.12)",
                  border: "1px solid rgba(79,189,186,0.25)",
                }}
              >
                <cat.Icon className="w-3.5 h-3.5" style={{ color: "#4FBDBA" }} strokeWidth={1.5} />
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: "#4FBDBA" }}>
                {cat.title}
              </span>
            </div>

            {/* Accent divider */}
            <div
              className="mb-5 h-px w-full group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(to right, rgba(79,189,186,0.4), transparent)" }}
            />

            {/* Items */}
            <ul className="space-y-3">
              {cat.items.map(item => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    className="mt-[5px] h-1 w-1 shrink-0"
                    style={{ background: "#4FBDBA", transform: "rotate(45deg)" }}
                  />
                  <span className="font-mono text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom accent strip */}
      <div
        className="px-6 sm:px-8 py-3 flex items-center gap-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.15)" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: "rgba(79,189,186,0.5)" }}>
          Coverage
        </span>
        <div className="h-px flex-1" style={{ background: "rgba(79,189,186,0.12)" }} />
        <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
          US · UK · IN · DE · FR · JP · CN · SG · AU · BR · ES · IT · NL · SE · CA · CH · NZ
        </span>
      </div>
    </div>
  )
}

function MetricCard({
  metric,
  index,
}: {
  metric: { date: string; title: string; note: string; accent: string; accentLight: string }
  index: number
}) {
  return (
    <article
      className="group relative flex-shrink-0 w-72 transition-transform duration-500 ease-out hover:-translate-y-1.5"
    >
      {/* Card */}
      <div
        className="relative overflow-hidden h-full"
        style={{
          background: "rgba(240,247,250,0.85)",
          border: "1px solid rgba(27,73,101,0.14)",
          borderTop: `2px solid ${metric.accent}`,
        }}
      >
        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 20% 0%, ${metric.accentLight} 0%, transparent 65%)` }}
        />

        <div className="relative p-6">
          {/* Index + category tag row */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.3em] tabular-nums"
              style={{ color: metric.accent }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5"
              style={{
                color: metric.accent,
                background: metric.accentLight,
                border: `1px solid ${metric.accent}33`,
              }}
            >
              {metric.date}
            </span>
          </div>

          {/* Title */}
          <h3
            className="font-[var(--font-bebas)] text-3xl tracking-tight leading-none mb-3"
            style={{ color: "#1B4965" }}
          >
            {metric.title}
          </h3>

          {/* Accent rule */}
          <div
            className="h-px mb-4 group-hover:opacity-100 transition-all duration-500"
            style={{ background: `linear-gradient(to right, ${metric.accent}, transparent)`, opacity: 0.5 }}
          />

          {/* Note */}
          <p className="font-mono text-[11px] leading-relaxed" style={{ color: "#3d6070" }}>
            {metric.note}
          </p>
        </div>

        {/* Bottom-right corner tick */}
        <span className="absolute bottom-0 right-0 w-3 h-3 border-r border-b" style={{ borderColor: metric.accent + "66" }} />
      </div>
    </article>
  )
}

