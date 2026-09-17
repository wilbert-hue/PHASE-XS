"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const certifications = [
  {
    src: "https://www.coherentmarketinsights.com/images/duns-registerednewupdsma.webp",
    alt: "D-U-N-S Registered",
    label: "860519526",
    width: 80,
    height: 70,
    maxH: 64,
  },
  { alt: "ESOMAR", src: "", label: "", width: 0, height: 0, maxH: 0 },
  {
    src: "https://www.coherentmarketinsights.com/images/iso-9001--NewUpda.webp",
    alt: "ISO 9001:2015",
    label: "9001:2015",
    width: 72,
    height: 72,
    maxH: 64,
  },
  {
    src: "https://www.coherentmarketinsights.com/images/iso-27001--NewUpda.webp",
    alt: "ISO 27001:2022",
    label: "27001:2022",
    width: 72,
    height: 72,
    maxH: 64,
  },
  {
    src: "https://www.coherentmarketinsights.com/images/clutupdatednewupdsma.webp",
    alt: "Clutch",
    label: "",
    width: 130,
    height: 65,
    maxH: 60,
  },
  {
    src: "https://www.coherentmarketinsights.com/images/Trustpilot-27.webp",
    alt: "Trustpilot",
    label: "",
    width: 140,
    height: 80,
    maxH: 70,
  },
]

function EsomarBadge() {
  return (
    <div
      title="ESOMAR Individual Member 2026"
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        userSelect: "none",
      }}
    >
      {/* Top stripe — ESOMAR wordmark */}
      <div
        style={{
          background: "#003478",
          padding: "5px 12px 4px",
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontFamily: "Arial, sans-serif",
            fontWeight: 900,
            fontSize: 15,
            letterSpacing: "0.06em",
            color: "#ffffff",
            textTransform: "uppercase",
          }}
        >
          esomar
        </span>
      </div>
      {/* Bottom stripe — year + member type */}
      <div
        style={{
          background: "#F5C400",
          padding: "3px 12px 3px",
          lineHeight: 1,
          width: "100%",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Arial, sans-serif",
            fontWeight: 700,
            fontSize: 8,
            letterSpacing: "0.08em",
            color: "#003478",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Individual · 2026
        </span>
      </div>
    </div>
  )
}

export function CredibilitySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

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
    <section ref={sectionRef} className="relative py-16 md:py-20 px-4 sm:px-6 lg:px-12 xl:px-20">
      <div
        ref={cardRef}
        className="flex flex-col lg:flex-row items-stretch overflow-hidden"
        style={{
          border: "1px solid rgba(27, 73, 101, 0.15)",
          background: "rgba(232, 240, 243, 0.5)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 24px rgba(27, 73, 101, 0.06)",
        }}
      >
        {/* Left text block */}
        <div className="flex items-center gap-5 px-8 md:px-12 py-8 md:py-10 lg:w-[420px] flex-shrink-0">
          <div
            className="w-12 h-12 flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #1B4965, #2A8F9C)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <h4
              className="font-[var(--font-bebas)] text-xl md:text-2xl tracking-wide leading-tight"
              style={{ color: "#1B4965" }}
            >
              Credibility & Certifications
            </h4>
            <p className="font-mono text-xs md:text-sm leading-relaxed mt-2 max-w-[320px]" style={{ color: "#1B4965" }}>
              Trusted Insights, Certified Excellence! Coherent Market Insights is a certified data advisory and business consulting firm recognized by global institutes.
            </p>
          </div>
        </div>

        {/* Certification logos */}
        <div
          className="flex-1 flex flex-wrap"
          style={{ borderLeft: "1px solid rgba(27, 73, 101, 0.10)" }}
        >
          {certifications.map((cert, i) => (
            <div
              key={cert.alt}
              className="flex flex-col items-center justify-center py-5 md:py-6 px-3 transition-all duration-200 hover:bg-white/50"
              style={{
                flex: "1 1 0",
                minWidth: 80,
                borderLeft: i > 0 ? "1px solid rgba(27, 73, 101, 0.08)" : "none",
              }}
            >
              {cert.alt === "ESOMAR" ? (
                <EsomarBadge />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cert.src}
                    alt={cert.alt}
                    title={cert.alt}
                    width={cert.width}
                    height={cert.height}
                    loading="lazy"
                    className="object-contain max-w-full"
                    style={{ height: `${cert.maxH}px` }}
                  />
                  {cert.label && (
                    <span className="font-mono text-[10px] mt-1.5" style={{ color: "#1B4965" }}>
                      {cert.label}
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

