"use client"

export function CmiVentureBanner() {
  return (
    <div
      className="relative overflow-hidden py-5 px-4 sm:px-6 lg:px-12 xl:px-20"
      style={{
        background: "linear-gradient(135deg, #1B4965 0%, #1E6080 50%, #2A8F9C 100%)",
        borderTop: "1px solid rgba(79,189,186,0.2)",
        borderBottom: "1px solid rgba(79,189,186,0.2)",
      }}
    >
      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
        {/* Logo mark */}
        <svg width="20" height="20" viewBox="0 0 44 44" fill="none" className="shrink-0 opacity-80">
          <circle cx="22" cy="22" r="19" stroke="white" strokeWidth="1.3" strokeDasharray="3 2.5"/>
          <circle cx="22" cy="22" r="11" stroke="white" strokeWidth="1" opacity="0.4"/>
          <line x1="22" y1="2"  x2="22" y2="9"  stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="22" y1="35" x2="22" y2="42" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="2"  y1="22" x2="9"  y2="22" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="35" y1="22" x2="42" y2="22" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="22" cy="22" r="2.5" fill="white"/>
        </svg>

        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/90">
          <span className="font-semibold text-white">PHASE-XS</span>
          {" "}is a venture of{" "}
          <span className="font-semibold text-white">Coherent Market Insights</span>
        </p>

        <div
          className="hidden sm:block h-3 w-px opacity-30"
          style={{ background: "white" }}
        />

        <a
          href="https://www.coherentmarketinsights.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors duration-200"
        >
          coherentmarketinsights.com →
        </a>
      </div>
    </div>
  )
}

