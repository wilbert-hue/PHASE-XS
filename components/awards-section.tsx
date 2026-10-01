"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const ACCOLADES_URL = "https://www.coherentmarketinsights.com/accolades"

const awards = [
  {
    src: "https://www.coherentmarketinsights.com/images/best-msme-award01.webp",
    alt: "India 5000 Best MSME Awards",
    width: 110,
    height: 90,
    maxH: 68,
  },
  {
    src: "https://www.coherentmarketinsights.com/images/wealth-and-finance.webp",
    alt: "Wealth & Finance Management Consulting Awards",
    width: 150,
    height: 60,
    maxH: 46,
  },
  {
    src: "https://www.coherentmarketinsights.com/images/siliconreviewUpdated.webp",
    alt: "The Silicon Review",
    width: 200,
    height: 30,
    maxH: 30,
  },
  {
    src: "https://www.coherentmarketinsights.com/images/ceotodayUpdated.webp",
    alt: "CEO Today",
    width: 120,
    height: 70,
    maxH: 54,
  },
  {
    src: "https://www.coherentmarketinsights.com/images/BEST-STARTUPUpdated.webp",
    alt: "Best Startup",
    width: 231,
    height: 35,
    maxH: 35,
  },
  {
    src: "https://www.coherentmarketinsights.com/images/best500Updated.webp",
    alt: "Best 5000 MSME in India",
    width: 150,
    height: 38,
    maxH: 30,
  },
]

export function AwardsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !cardRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative pt-0 pb-16 md:pb-20 px-4 sm:px-6 lg:px-12 xl:px-20">
      <a
        ref={cardRef}
        href={ACCOLADES_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View all awards and accolades on Coherent Market Insights"
        className="group flex flex-col lg:flex-row items-stretch overflow-hidden transition-all duration-300"
        style={{
          border: "1px solid rgba(27, 73, 101, 0.15)",
          background: "rgba(232, 240, 243, 0.5)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 24px rgba(27, 73, 101, 0.06)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(42, 143, 156, 0.45)"
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(27, 73, 101, 0.12)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(27, 73, 101, 0.15)"
          e.currentTarget.style.boxShadow = "0 4px 24px rgba(27, 73, 101, 0.06)"
        }}
      >
        {/* Left text block */}
        <div className="flex items-center gap-5 px-8 md:px-12 py-8 md:py-10 lg:w-[420px] flex-shrink-0">
          <div
            className="w-12 h-12 flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1B4965, #2A8F9C)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0012 0V2z" />
            </svg>
          </div>
          <div>
            <h4
              className="font-[var(--font-bebas)] text-xl md:text-2xl tracking-wide leading-tight flex items-center gap-2"
              style={{ color: "#1B4965" }}
            >
              Awards &amp; Accolades
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2A8F9C"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                <path d="M7 17L17 7" />
                <path d="M9 7h8v8" />
              </svg>
            </h4>
            <p className="font-mono text-xs md:text-sm leading-relaxed mt-2 max-w-[320px]" style={{ color: "#1B4965" }}>
              Recognized Excellence! Coherent Market Insights&apos; accolades reflect our innovation, growth, and impact across the market research and consulting industry.
            </p>
          </div>
        </div>

        {/* Award logos */}
        <div className="flex-1 flex flex-wrap" style={{ borderLeft: "1px solid rgba(27, 73, 101, 0.10)" }}>
          {awards.map((award, i) => (
            <div
              key={award.alt}
              className="flex flex-col items-center justify-center py-5 md:py-6 px-3 transition-all duration-200 hover:bg-white/50"
              style={{
                flex: "1 1 0",
                minWidth: 110,
                borderLeft: i > 0 ? "1px solid rgba(27, 73, 101, 0.08)" : "none",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={award.src}
                alt={award.alt}
                title={award.alt}
                width={award.width}
                height={award.height}
                loading="lazy"
                className="object-contain max-w-full"
                style={{ height: `${award.maxH}px` }}
              />
            </div>
          ))}
        </div>
      </a>
    </section>
  )
}
