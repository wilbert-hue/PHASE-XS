"use client"

import { useRef, useEffect } from "react"
import { HighlightText } from "@/components/highlight-text"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function PrinciplesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const principlesRef = useRef<HTMLDivElement>(null)

  const principles = [
    {
      number: "01",
      titleParts: [
        { text: "EVIDENCE", highlight: true },
        { text: " DRIVEN", highlight: false },
      ],
      description: "Every insight is grounded in real clinical data — 3,049 trials, rigorously sourced and continuously validated.",
      align: "left",
      accent: "#1B4965",
    },
    {
      number: "02",
      titleParts: [
        { text: "MOLECULE", highlight: true },
        { text: " TO MARKET", highlight: false },
      ],
      description: "Track the full lifecycle from early-phase discovery through approval, pricing, and post-market surveillance.",
      align: "right",
      accent: "#1E6080",
    },
    {
      number: "03",
      titleParts: [
        { text: "REAL-TIME ", highlight: false },
        { text: "SIGNALS", highlight: true },
      ],
      description: "Competitive intelligence across sponsors, technologies, and therapeutic areas — filterable, sortable, actionable.",
      align: "left",
      accent: "#2A8F9C",
    },
    {
      number: "04",
      titleParts: [
        { text: "PRECISION ", highlight: false },
        { text: "ANALYTICS", highlight: true },
      ],
      description: "Enrollment forecasts, adherence tracking, and pricing intelligence across 1,246 unique molecules and 1,085 indications.",
      align: "right",
      accent: "#3AAFA9",
    },
  ]

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !principlesRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        x: -60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      })

      const articles = principlesRef.current?.querySelectorAll("article")
      articles?.forEach((article, index) => {
        const isRight = principles[index].align === "right"
        gsap.from(article, {
          x: isRight ? 80 : -80,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: article,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="platform" className="relative py-32 px-4 sm:px-6 lg:px-12 xl:px-20">
      {/* Section header */}
      <div ref={headerRef} className="mb-24">
        {/* Label — c3 */}
        <span className="font-mono text-sm uppercase tracking-[0.3em]" style={{ color: "#2A8F9C" }}>
          03 / Platform
        </span>
        {/* Heading — c1 */}
        <h2
          className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight"
          style={{ color: "#1B4965" }}
        >
          WHY PHASE-XS ?
        </h2>
      </div>

      {/* Staggered principles */}
      <div ref={principlesRef} className="space-y-24 md:space-y-32">
        {principles.map((principle, index) => (
          <article
            key={index}
            className={`flex flex-col ${
              principle.align === "right" ? "items-end text-right" : "items-start text-left"
            }`}
          >
            {/* Number label — each principle's accent */}
            <span
              className="font-mono text-[10px] uppercase tracking-[0.3em] mb-4"
              style={{ color: principle.accent }}
            >
              {principle.number} / {principle.titleParts[0].text.split(" ")[0]}
            </span>

            <h3 className="font-[var(--font-bebas)] text-4xl md:text-6xl lg:text-8xl tracking-tight leading-none">
              {principle.titleParts.map((part, i) =>
                part.highlight ? (
                  <HighlightText key={i} parallaxSpeed={0.6}>
                    {part.text}
                  </HighlightText>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </h3>

            <p className="mt-6 max-w-md font-mono text-sm leading-relaxed" style={{ color: "#1B4965" }}>
              {principle.description}
            </p>

            {/* Divider line — each principle's accent */}
            <div
              className={`mt-8 h-[1px] w-24 md:w-48 ${principle.align === "right" ? "mr-0" : "ml-0"}`}
              style={{
                background: `linear-gradient(to ${principle.align === "right" ? "left" : "right"}, ${principle.accent}, transparent)`,
              }}
            />
          </article>
        ))}
      </div>
    </section>
  )
}

