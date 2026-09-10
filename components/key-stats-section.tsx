"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Lightbulb, FileText, Users, UserCog } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const stats = [
  {
    icon: Lightbulb,
    value: "1,200+",
    label: "Insights Published Per Year",
  },
  {
    icon: FileText,
    value: "4,800+",
    label: "Consulting Projects Still Now",
  },
  {
    icon: UserCog,
    value: "350+",
    label: "Analysts and Contract Consultants",
  },
  {
    icon: Users,
    value: "5,150+",
    label: "Clients Worldwide",
  },
]

export function KeyStatsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }
      if (gridRef.current) {
        const items = gridRef.current.querySelectorAll(":scope > div")
        gsap.from(items, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative flex flex-col lg:flex-row overflow-hidden mb-16 md:mb-24">
      {/* Left — Key Stats (dark blue) */}
      <div
        className="relative flex-1 py-10 md:py-14 px-6 md:px-12 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f2d46 0%, #153c5d 50%, #1B4965 100%)",
        }}
      >
      {/* Diagonal line texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #ffffff 0, #ffffff 1px, transparent 1px, transparent 14px)",
        }}
      />
      {/* Soft glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 50% at 20% 20%, rgba(42,143,156,0.25), transparent 70%), radial-gradient(45% 45% at 85% 85%, rgba(79,189,186,0.18), transparent 70%)",
        }}
      />

      <div className="relative">
        {/* Heading with decorative lines */}
        <div ref={headerRef} className="flex items-center justify-center gap-3 mb-7">
          <span className="hidden md:block h-px w-10" style={{ background: "rgba(255,255,255,0.5)" }} />
          <h2 className="font-[var(--font-bebas)] text-xl md:text-2xl tracking-widest text-white text-center">
            KEY STATS
          </h2>
          <span className="hidden md:block h-px w-10" style={{ background: "rgba(255,255,255,0.5)" }} />
        </div>

        {/* Stats grid */}
        <div
          ref={gridRef}
          className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 md:gap-x-6"
        >
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded border"
                style={{
                  borderColor: "rgba(255,255,255,0.35)",
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                <Icon className="h-5 w-5 text-white" strokeWidth={1.4} />
              </div>
              <div>
                <div className="font-[var(--font-bebas)] text-xl md:text-2xl tracking-wide text-white leading-none">
                  {value}
                </div>
                <div className="mt-1 font-mono text-[10px] text-white/80 leading-snug">
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Right — Discover Our Latest Insights (green) */}
      <div
        className="relative lg:w-[32%] flex items-center justify-center py-8 md:py-10 px-6 md:px-8 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #7cb342 0%, #8bc34a 50%, #689f38 100%)",
        }}
      >
        {/* Diagonal line texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #ffffff 0, #ffffff 1px, transparent 1px, transparent 14px)",
          }}
        />
        <div className="relative text-center max-w-md">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-6 bg-white/70" />
            <h3 className="font-[var(--font-bebas)] text-lg md:text-xl tracking-wider text-white">
              Discover Our Latest Insights
            </h3>
            <span className="h-px w-6 bg-white/70" />
          </div>
          <p className="font-mono text-[10px] leading-relaxed text-white/95 mb-4">
            Market insights across Healthcare, Chemicals, ICT, Semiconductor, Aerospace,
            Telecom, Consumer Goods, Energy, and Food &amp; Beverages.
          </p>
          <a
            href="#"
            className="inline-flex items-center justify-center px-5 py-2 bg-white text-[#1B4965] font-mono text-[10px] uppercase tracking-widest hover:bg-white/90 transition-colors shadow-md"
          >
            Latest Insights
          </a>
        </div>
      </div>
    </section>
  )
}
