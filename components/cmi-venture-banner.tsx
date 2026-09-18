"use client"

import Link from "next/link"

const TICK_BORDER = "rgba(79,189,186,0.5)"

export function CmiVentureBanner() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f2d46 0%, #1B4965 40%, #1E6080 70%, #2A8F9C 100%)",
        borderTop: "1px solid rgba(79,189,186,0.25)",
        borderBottom: "1px solid rgba(79,189,186,0.25)",
      }}
    >
      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 100% at 50% 50%, rgba(79,189,186,0.07) 0%, transparent 70%)" }}
      />
      {/* Corner ticks */}
      <span className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2" style={{ borderColor: TICK_BORDER }} />
      <span className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2" style={{ borderColor: TICK_BORDER }} />
      <span className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2" style={{ borderColor: TICK_BORDER }} />
      <span className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2" style={{ borderColor: TICK_BORDER }} />

      <div className="relative px-6 sm:px-10 lg:px-16 xl:px-20 py-10 md:py-12">

        {/* ── Row 1: Identity + CTA ── */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-8"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Left — logo + parent brand */}
          <div className="flex items-center gap-4">
            <svg width="36" height="36" viewBox="0 0 44 44" fill="none" className="shrink-0">
              <circle cx="22" cy="22" r="19" stroke="#4FBDBA" strokeWidth="1.3" strokeDasharray="3 2.5"/>
              <circle cx="22" cy="22" r="11" stroke="#4FBDBA" strokeWidth="1" opacity="0.5"/>
              <line x1="22" y1="2"  x2="22" y2="9"  stroke="#4FBDBA" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="22" y1="35" x2="22" y2="42" stroke="#4FBDBA" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="2"  y1="22" x2="9"  y2="22" stroke="#4FBDBA" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="35" y1="22" x2="42" y2="22" stroke="#4FBDBA" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="22" cy="22" r="2.5" fill="#4FBDBA"/>
            </svg>
            <div>
              <div className="font-[var(--font-bebas)] text-2xl tracking-[0.1em] text-white leading-none">PHASE-XS</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">A venture of</span>
                <a
                  href="https://www.coherentmarketinsights.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[9px] uppercase tracking-wider text-white/70 hover:text-[#4FBDBA] transition-colors duration-200"
                >
                  Coherent Market Insights ↗
                </a>
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4FBDBA] mt-1">Clinical Intelligence</div>
            </div>
          </div>

          {/* Right — CTA */}
          <div className="flex flex-col items-center sm:items-end gap-2 text-center sm:text-right shrink-0">
            <p className="font-mono text-[10px] text-white/70 leading-relaxed">
              Ready to accelerate your clinical research decisions?
            </p>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white transition-all duration-300"
              style={{
                background: "rgba(79,189,186,0.15)",
                border: "1px solid rgba(79,189,186,0.5)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(79,189,186,0.28)"
                e.currentTarget.style.borderColor = "#4FBDBA"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(79,189,186,0.15)"
                e.currentTarget.style.borderColor = "rgba(79,189,186,0.5)"
              }}
            >
              Contact Us
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-0.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* ── Row 2: Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 mt-8 gap-y-8 sm:gap-y-0">
          {[
            {
              stat: "40,000+",
              label: "Clinical Trials",
              detail: "Spanning 17 countries across all major therapeutic areas",
            },
            {
              stat: "24h",
              label: "Response Time",
              detail: "Our team responds to every inquiry within one business day",
            },
            {
              stat: "1,200+",
              label: "Insights / Year",
              detail: "Published annually across pharma, biotech & clinical domains",
            },
          ].map((item, i) => (
            <div
              key={item.label}
              className="flex flex-col gap-2 sm:px-8"
              style={{
                borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}
            >
              <div
                className="font-[var(--font-bebas)] text-4xl md:text-5xl tracking-wide leading-none"
                style={{ color: "#4FBDBA" }}
              >
                {item.stat}
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-white">
                {item.label}
              </div>
              <div className="h-px w-8" style={{ background: "rgba(79,189,186,0.4)" }} />
              <div className="font-mono text-sm leading-relaxed" style={{ color: "#ffffff" }}>
                {item.detail}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
