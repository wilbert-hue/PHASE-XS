"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const stats = [
  {
    value: "85-92%",
    title: "Proof of Authenticity of Data",
    description: "Incisive insights cutting across sectors, categories, and geographical horizons",
    color: "#1B4965",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#1B4965" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="24" height="30" rx="2" />
        <path d="M10 14h12M10 20h12M10 26h8" />
        <circle cx="34" cy="30" r="10" fill="none" />
        <path d="M30 30l3 3 5-6" />
      </svg>
    ),
  },
  {
    value: "73%+",
    title: "Client Retention Rate",
    description: "On an average, 73% of our existing clients have resubscribed to our services",
    color: "#1E6080",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#1E6080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="16" r="8" />
        <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" />
        <path d="M36 12l4-4m0 0l4 4m-4-4v10" />
      </svg>
    ),
  },
  {
    value: "24 Hours",
    title: "Quick Turn-around",
    description: "Proven expertise of delivering optimized solutions",
    color: "#2A8F9C",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#2A8F9C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="18" />
        <path d="M24 12v12l8 4" />
      </svg>
    ),
  },
  {
    value: "1200+",
    title: "Niche Segments",
    description: "The go-to research solution provider for complex, hard-to-find insights",
    color: "#3AAFA9",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#3AAFA9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="18" />
        <circle cx="24" cy="24" r="11" />
        <circle cx="24" cy="24" r="4" />
        <path d="M38 10l-10 10" />
        <path d="M34 8l6 2-2 6" />
      </svg>
    ),
  },
]

export function WhyCmiSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !cardsRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        },
      )

      const cards = cardsRef.current?.querySelectorAll(".stat-card")
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-20 md:py-24 px-4 sm:px-6 lg:px-12 xl:px-20">
      {/* Header with decorative lines */}
      <div ref={headerRef} className="flex items-center justify-center gap-4 mb-14 md:mb-16">
        <div
          className="hidden md:block flex-1 h-[1px] max-w-[120px]"
          style={{ background: "linear-gradient(to right, transparent, #2A8F9C)" }}
        />
        <h2
          className="font-[var(--font-bebas)] text-2xl md:text-3xl tracking-wide text-center uppercase"
          style={{ color: "#1B4965" }}
        >
          Why Coherent Market Insights?
        </h2>
        <div
          className="hidden md:block flex-1 h-[1px] max-w-[120px]"
          style={{ background: "linear-gradient(to left, transparent, #2A8F9C)" }}
        />
      </div>

      {/* Stats grid */}
      <div ref={cardsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="stat-card group text-center flex flex-col items-center"
          >
            {/* Icon */}
            <div
              className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-110"
              style={{
                border: `1px solid ${stat.color}20`,
                background: `${stat.color}08`,
              }}
            >
              {stat.icon}
            </div>

            {/* Value */}
            <p
              className="font-[var(--font-bebas)] text-3xl md:text-4xl tracking-tight"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>

            {/* Title */}
            <p
              className="font-mono text-xs md:text-sm font-semibold mt-1 mb-2"
              style={{ color: "#0c1b24" }}
            >
              {stat.title}
            </p>

            {/* Description */}
            <p
              className="font-mono text-[11px] leading-relaxed max-w-full sm:max-w-[240px]"
              style={{ color: "#1B4965" }}
            >
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
