"use client"

import { useRef, useState, useEffect } from "react"
import { BarChart3, Globe2, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const metrics = [
  {
    date: "Phase 3",
    title: "707K+ Enrolled",
    note: "Total participants enrolled across all tracked trials — the largest segment in late-stage studies.",
    accent: "#2563EB",
    accentLight: "rgba(37, 99, 235, 0.1)",
  },
  {
    date: "Oncology",
    title: "Top Indication",
    note: "Leukemia, lymphoma, and solid tumors dominate the trial landscape with 40%+ of all studies.",
    accent: "#BE123C",
    accentLight: "rgba(190, 18, 60, 0.09)",
  },
  {
    date: "mAb",
    title: "Leading Tech",
    note: "Monoclonal antibodies represent the dominant technology platform across all phases.",
    accent: "#6D28D9",
    accentLight: "rgba(109, 40, 217, 0.1)",
  },
  {
    date: "92.3%",
    title: "Adherence Rate",
    note: "Average patient compliance across all tracked trials — a key indicator of protocol feasibility.",
    accent: "#0D9488",
    accentLight: "rgba(13, 148, 136, 0.1)",
  },
]

export function SignalsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
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
    if (!sectionRef.current || !headerRef.current || !cardsRef.current) return

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

      const cards = cardsRef.current?.querySelectorAll("article")
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
              trigger: cardsRef.current,
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
    <section id="metrics" ref={sectionRef} className="relative py-32 pl-6 md:pl-28">
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
      <div ref={headerRef} className="mb-16 pr-6 md:pr-12">
        {/* Label — c4 */}
        <span
          className="font-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ color: "#3AAFA9" }}
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
        ref={(el) => {
          scrollRef.current = el
          cardsRef.current = el
        }}
        className="flex gap-8 overflow-x-auto pb-8 pr-12 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} index={index} />
        ))}
      </div>

      {/* Diagram-style scope block — hub + bracketed lists (see dataset breadth at a glance) */}
      <DatasetScopeDiagram />
    </section>
  )
}

const scopeDiagramRows: {
  hub: string
  Icon: LucideIcon
  left: { title: string; items: string[] }
  right: { title: string; items: string[] }
}[] = [
  {
    hub: "TRIAL\nLANDSCAPE",
    Icon: BarChart3,
    left: {
      title: "Coverage",
      items: ["3,049 Trials", "1,246 Molecules", "1,085 Indications"],
    },
    right: {
      title: "Phases",
      items: ["Early Phase 1", "Phase 1 – 4", "Combined Phases"],
    },
  },
  {
    hub: "MODALITY\n& REGION",
    Icon: Globe2,
    left: {
      title: "Technologies",
      items: ["Monoclonal Antibodies", "CAR-T / Cell Therapy", "ADCs & Biosimilars"],
    },
    right: {
      title: "Region",
      items: ["United States", "Global Collaborators"],
    },
  },
]

function DatasetScopeDiagram() {
  return (
    <div
      className="mt-24 mr-6 md:mr-12 relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0f2d3f] via-[#0a2230] to-[#051820] p-6 sm:p-8 md:p-10 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.5)]"
      aria-label="Dataset scope overview"
    >
      <div
        className="absolute top-3 left-4 h-1.5 w-1.5 rounded-full bg-[#4FBDBA] shadow-[0_0_10px_#4FBDBA80]"
        aria-hidden
      />
      <p className="text-center font-mono text-sm sm:text-base md:text-lg font-medium uppercase tracking-[0.28em] text-[#9ee5ed] mb-8 md:mb-10">
        Dataset scope
      </p>

      {scopeDiagramRows.map((row, i) => (
        <div key={row.hub}>
          {i > 0 && (
            <div className="my-8 md:my-10 border-t border-dashed border-white/18" role="separator" />
          )}
          <ScopeHubRow
            hub={row.hub}
            Icon={row.Icon}
            left={row.left}
            right={row.right}
          />
        </div>
      ))}
    </div>
  )
}

function ScopeHubRow({
  hub,
  Icon,
  left,
  right,
}: {
  hub: string
  Icon: LucideIcon
  left: { title: string; items: string[] }
  right: { title: string; items: string[] }
}) {
  return (
    <div className="relative max-w-5xl mx-auto">
      {/* horizontal spine + nodes (desktop) */}
      <div
        className="pointer-events-none hidden md:block absolute left-[8%] right-[8%] top-[calc(50%-0.5px)] h-px bg-white/10 z-0"
        aria-hidden
      />
      <div
        className="pointer-events-none hidden md:block absolute left-[8%] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/50 ring-1 ring-white/20 z-[1]"
        aria-hidden
      />
      <div
        className="pointer-events-none hidden md:block absolute right-[8%] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/50 ring-1 ring-white/20 z-[1]"
        aria-hidden
      />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_9.5rem_1fr] gap-8 md:gap-0 md:items-center">
        <div className="order-2 md:order-1 min-w-0 md:pr-6">
          <ScopeList
            side="left"
            title={left.title}
            items={left.items}
          />
        </div>

        <div className="order-1 md:order-2 flex justify-center md:px-1">
          <div className="relative w-[8.25rem] h-[8.25rem] sm:w-[8.75rem] sm:h-[8.75rem] rounded-full border-2 border-white/32 bg-gradient-to-b from-white/[0.14] to-white/[0.04] flex flex-col items-center justify-center text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_0_1px_rgba(79,189,186,0.12)]">
            <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-[#a8e6ef] mb-1" strokeWidth={1.35} aria-hidden />
            <span className="font-[var(--font-bebas)] text-xs sm:text-base leading-tight tracking-wide text-white/95 px-1 whitespace-pre-line max-w-[7rem]">
              {hub}
            </span>
          </div>
        </div>

        <div className="order-3 min-w-0 md:pl-6">
          <ScopeList
            side="right"
            title={right.title}
            items={right.items}
          />
        </div>
      </div>
    </div>
  )
}

function ScopeList({
  side,
  title,
  items,
}: {
  side: "left" | "right"
  title: string
  items: string[]
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        side === "left" && "md:text-right md:rounded-r-md",
        side === "right" && "md:rounded-l-md",
      )}
    >
      <p
        className={cn(
          "font-mono text-sm sm:text-base font-semibold uppercase tracking-[0.22em] mb-3.5 text-[#7edeea]",
          side === "left" && "md:text-right",
        )}
      >
        {title}
      </p>
      <ul className="space-y-2.5 list-none p-0 m-0">
        {items.map(item => (
          <li
            key={item}
            className={cn(
              "font-mono text-xs sm:text-sm text-white/86 leading-relaxed",
              "flex items-start gap-2.5",
              side === "left" && "md:flex-row-reverse md:justify-end",
            )}
          >
            <span
              className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 bg-white/90"
              style={{ transform: "rotate(45deg)" }}
              aria-hidden
            />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
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
      className={cn(
        "group relative flex-shrink-0 w-80",
        "transition-transform duration-500 ease-out",
        "hover:-translate-y-2",
      )}
    >
      <div className="relative bg-card/90 border border-border/60 md:border-t md:border-l md:border-r-0 md:border-b-0 p-8 overflow-hidden shadow-md shadow-[rgba(15,30,50,0.08)]">
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(to right, ${metric.accent}, transparent)`,
          }}
        />

        {/* Hover background glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${metric.accentLight} 0%, transparent 70%)`,
          }}
        />

        <div className="flex items-baseline justify-between mb-8 relative">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: metric.accent }}
          >
            No. {String(index + 1).padStart(2, "0")}
          </span>
          <time
            className="font-mono text-[10px] font-medium"
            style={{ color: metric.accent, opacity: 0.7 }}
          >
            {metric.date}
          </time>
        </div>

        <h3
          className="font-[var(--font-bebas)] text-4xl tracking-tight mb-4 transition-colors duration-300"
          style={{ color: metric.accent }}
        >
          {metric.title}
        </h3>

        <div
          className="w-12 h-[2px] mb-6 group-hover:w-full transition-all duration-500"
          style={{
            background: `linear-gradient(to right, ${metric.accent}, transparent)`,
          }}
        />

        <p className="font-mono text-xs leading-relaxed relative" style={{ color: "#3d6070" }}>{metric.note}</p>

        <div className="absolute bottom-0 right-0 w-6 h-6 overflow-hidden">
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-background rotate-45 translate-x-4 translate-y-4 border-t border-l border-border/30" />
        </div>
      </div>

      {/* Hover shadow */}
      <div
        className="absolute inset-0 -z-10 translate-x-1 translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: metric.accentLight }}
      />
    </article>
  )
}
