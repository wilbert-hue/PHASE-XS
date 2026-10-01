import type { Metadata } from "next"
import Link from "next/link"
import { TopNav } from "@/components/top-nav"
import { Footer } from "@/components/footer"
import { ContactTab } from "@/components/contact-tab"
import { AnimatedBackground } from "@/components/animated-background"
import { CmiVentureBanner } from "@/components/cmi-venture-banner"
import { CredibilitySection } from "@/components/credibility-section"
import { AwardsSection } from "@/components/awards-section"
import { PageSection } from "@/components/page-section"

export const metadata: Metadata = {
  title: "About Us — PHASE-XS",
  description:
    "PHASE-XS is a self-service, AI-powered clinical intelligence platform for pharma and biotech teams — 40,000+ trials, 1,188+ molecules, 1,178+ indications across 17 countries.",
}

const coverageStats = [
  { value: "40,000+", label: "Clinical Trials" },
  { value: "1,188+", label: "Drug Molecules" },
  { value: "1,178+", label: "Indications" },
  { value: "17", label: "Countries" },
]

const capabilities = [
  {
    title: "AI-Powered Search",
    body: "Query the full trial corpus in natural language and surface the molecules, sponsors, and studies that matter.",
  },
  {
    title: "Therapeutic Segmentation",
    body: "Slice coverage by therapeutic category, geography, phase, and biologic type across every country tracked.",
  },
  {
    title: "Phase-Level Analysis",
    body: "Break down pipelines by development stage, from Early Phase 1 through Phase 4 and post-market activity.",
  },
  {
    title: "Sponsor Benchmarking",
    body: "Compare sponsor activity and pipeline composition to understand who is moving where, and how fast.",
  },
  {
    title: "Competitive Mapping",
    body: "Map the competitive landscape across indications, technologies, and approval timelines.",
  },
  {
    title: "Export & API",
    body: "Filter, sort, and export to Excel or CSV — or integrate directly through the enterprise API.",
  },
]

const commercialTerms = [
  "Modular, pay-per-category pricing",
  "No long-term contract",
  "Onboarding in under one business day",
]

const dataParameters = [
  {
    no: "01",
    category: "Core Identification",
    params: [
      "NCT ID / Trial Registry Number",
      "Trial Title",
      "Status / Recruitment Status",
      "Phase (I, II, III, IV)",
      "Study Type",
      "Study Design",
    ],
  },
  {
    no: "02",
    category: "Timeline & Dates",
    params: [
      "Start Date",
      "Completion / End Date",
      "Primary Completion Date",
      "Submission / Publish Date",
      "Last Updated Date",
      "Estimated Duration",
    ],
  },
  {
    no: "03",
    category: "Patient & Eligibility",
    params: [
      "Target Enrollment / Sample Size",
      "Age Criteria (Min / Max)",
      "Gender / Sex",
      "Inclusion Criteria",
      "Exclusion Criteria",
      "Healthy Volunteers Flag",
    ],
  },
  {
    no: "04",
    category: "Therapeutic Area",
    params: [
      "Conditions / Disease",
      "Pharmacological Class",
      "Therapeutic / Indication Area",
      "MedDRA / Condition Codes",
      "Rare Disease Flag",
      "ATC Code",
    ],
  },
  {
    no: "05",
    category: "Interventions",
    params: [
      "Interventions / Molecule Name",
      "Drug / Biologic / Biosimilar Type",
      "Dosage & Strength",
      "Route of Administration",
      "Technology Platform",
      "Comparator / Control Type",
    ],
  },
  {
    no: "06",
    category: "Sponsor & Regulatory",
    params: [
      "Sponsor Name & Type",
      "Collaborators / Co-Sponsors",
      "Source of Funding",
      "Ethics Approval Status",
      "Regulatory Clearance Status",
      "Reimbursement / Approval Data",
    ],
  },
  {
    no: "07",
    category: "Outcomes & Endpoints",
    params: [
      "Primary Endpoint / Objective",
      "Secondary Outcomes",
      "Endpoint Parameters",
      "Outcome Timepoints",
      "Adherence Rate",
      "Results Available Flag",
    ],
  },
  {
    no: "08",
    category: "Locations & Contact",
    params: [
      "Sites / Locations",
      "Countries of Recruitment",
      "Principal Investigator",
      "Contact Info",
      "Recruitment Hospital(s)",
    ],
  },
  {
    no: "09",
    category: "Market Intelligence (US)",
    params: [
      "Market Size & Forecast CAGR",
      "Drug Pricing Data",
      "Competitive Landscape",
      "Drug / Brand Switch Data",
      "Reimbursement Data",
      "Approved Biologics Flag",
    ],
  },
  {
    no: "10",
    category: "Registry-Specific IDs",
    params: [
      "CTRI Number (India)",
      "ISRCTN Number (UK)",
      "EudraCT / CT Number (EU)",
      "ACTRN Number (Australia)",
      "Member States Concerned (EU)",
    ],
  },
]

const missionPillars = [
  {
    no: "01",
    title: "Evidence-Based Clinical Data",
    body: "Bringing together clinical trial information from established registries and continuously validating key data points — trial identification, timelines, patient eligibility, therapeutic classification, interventions, sponsor and regulatory status, and outcomes.",
    accent: "#1B4965",
  },
  {
    no: "02",
    title: "Full Lifecycle Visibility",
    body: "Tracking molecules from early-phase development through approval, pricing, and post-market activity, with data standardized across the 17 countries covered by the platform.",
    accent: "#1E6080",
  },
  {
    no: "03",
    title: "Competitive & Therapeutic Analysis",
    body: "Helping teams monitor sponsor activity, therapeutic-area developments, and pipeline changes through AI-powered search, phase-level analysis, and competitive landscape mapping.",
    accent: "#2A8F9C",
  },
  {
    no: "04",
    title: "Molecule & Indication Analytics",
    body: "Providing tools for enrollment forecasting, adherence tracking, and pricing intelligence through a self-service dashboard or enterprise API — no long-term contract, onboarding in under one business day.",
    accent: "#3AAFA9",
  },
]

export default function AboutPage() {
  return (
    <main className="relative min-h-screen">
      <TopNav />
      <ContactTab />
      <AnimatedBackground />

      {/* Left + right white edge fade over the dot canvas */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: "linear-gradient(to right, white 0%, transparent 12%, transparent 88%, white 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* ── Hero ── */}
        <section className="px-4 sm:px-6 lg:px-12 xl:px-20 pt-28 sm:pt-32 lg:pt-36 pb-14 sm:pb-20">
          <div className="mb-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
            <Link href="/" className="transition-colors hover:text-[#1B4965]" style={{ color: "#3AAFA9" }}>
              ← Home
            </Link>
            <span style={{ color: "rgba(42,143,156,0.5)" }}>/</span>
            <span style={{ color: "#1E6080" }}>About</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8" style={{ background: "#4FBDBA" }} />
            <span className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: "#4FBDBA" }}>
              Who We Are
            </span>
          </div>

          <h1
            className="font-[var(--font-bebas)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-none"
            style={{ color: "#1B4965" }}
          >
            ABOUT PHASE-XS
          </h1>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
            <p className="font-mono text-sm sm:text-[15px] leading-relaxed" style={{ color: "#0c1b24" }}>
              PHASE-XS is a{" "}
              <span style={{ color: "#2A8F9C", fontWeight: 600 }}>self-service, AI-powered clinical intelligence platform</span>{" "}
              for pharma and biotech teams. It provides direct access to structured clinical trial data and analysis,
              particularly across areas such as oncology and biologics. Users can analyze trial data by therapeutic
              category, geography, phase, and biologic type across every country the platform covers.
            </p>
            <p className="font-mono text-xs sm:text-sm leading-relaxed" style={{ color: "#3d6070" }}>
              The platform brings clinical trial and drug development data together in one place — an information bank
              drawn from thousands of sources and thousands of primary research interviews — so teams can access and
              analyze it without stitching registries together by hand.
            </p>
          </div>

          {/* Coverage stat strip */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 lg:border-t lg:border-[#1B4965]/15">
            {coverageStats.map((stat) => (
              <div
                key={stat.label}
                className="py-6 sm:py-7 px-4 sm:px-5 border-t border-[#1B4965]/10 lg:border-t-0 lg:border-l lg:border-[#1B4965]/10 lg:first:border-l-0 lg:first:pl-0"
              >
                <div
                  className="font-[var(--font-bebas)] text-3xl sm:text-4xl lg:text-5xl tracking-wide leading-none"
                  style={{ color: "#2A8F9C" }}
                >
                  {stat.value}
                </div>
                <div
                  className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: "#3d6070" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* ── What the platform does ── */}
        <PageSection page="landing" variant="coverage">
          <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-14 sm:py-20 md:py-24">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8" style={{ background: "#4FBDBA" }} />
              <span className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: "#4FBDBA" }}>
                The Platform
              </span>
            </div>
            <h2
              className="font-[var(--font-bebas)] text-4xl sm:text-5xl md:text-6xl tracking-tight"
              style={{ color: "#1E6080" }}
            >
              MOLECULE TO MARKET
            </h2>
            <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed" style={{ color: "#3d6070" }}>
              PHASE-XS tracks drug development from early-stage trials through approval, pricing, and post-market
              activity — standardized across all 17 countries covered.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((cap) => (
                <div
                  key={cap.title}
                  className="group relative p-5 sm:p-6 transition-colors duration-300"
                  style={{
                    background: "rgba(240,247,250,0.7)",
                    border: "1px solid rgba(27,73,101,0.12)",
                  }}
                >
                  <span
                    className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
                    style={{ background: "linear-gradient(to right, #2A8F9C, transparent)" }}
                  />
                  <h3
                    className="font-[var(--font-bebas)] text-xl sm:text-2xl tracking-tight"
                    style={{ color: "#1B4965" }}
                  >
                    {cap.title}
                  </h3>
                  <div className="my-3 h-px w-8" style={{ background: "rgba(42,143,156,0.5)" }} />
                  <p className="font-mono text-[11px] leading-relaxed" style={{ color: "#3d6070" }}>
                    {cap.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Commercial terms */}
            <div
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 px-5 sm:px-6 py-4"
              style={{ borderLeft: "2px solid #4FBDBA", background: "rgba(79,189,186,0.05)" }}
            >
              {commercialTerms.map((term) => (
                <span key={term} className="flex items-center gap-2 font-mono text-[11px]" style={{ color: "#1B4965" }}>
                  <span
                    className="h-1 w-1 shrink-0"
                    style={{ background: "#2A8F9C", transform: "rotate(45deg)" }}
                  />
                  {term}
                </span>
              ))}
            </div>
          </section>
        </PageSection>

        {/* ── Data parameters ── */}
        <PageSection page="landing" variant="metrics">
          <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-14 sm:py-20 md:py-24">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8" style={{ background: "#4FBDBA" }} />
              <span className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: "#4FBDBA" }}>
                Data Parameters
              </span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <h2
                className="font-[var(--font-bebas)] text-4xl sm:text-5xl md:text-6xl tracking-tight"
                style={{ color: "#1B4965" }}
              >
                WHAT WE CAPTURE
              </h2>
              <p className="max-w-sm font-mono text-xs leading-relaxed lg:pb-2" style={{ color: "#3d6070" }}>
                Ten categories of structured fields, standardized and continuously validated across every trial in the
                dataset.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {dataParameters.map((group) => (
                <article
                  key={group.no}
                  className="relative overflow-hidden flex flex-col p-5"
                  style={{
                    background: "linear-gradient(155deg, #0c2236 0%, #102d44 55%, #0a1e2e 100%)",
                    border: "1px solid rgba(79,189,186,0.18)",
                    borderLeft: "2px solid #4FBDBA",
                  }}
                >
                  <span
                    className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2"
                    style={{ borderColor: "rgba(79,189,186,0.35)" }}
                  />
                  <span
                    className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2"
                    style={{ borderColor: "rgba(79,189,186,0.35)" }}
                  />
                  <div
                    className="absolute top-2 right-3 font-[var(--font-bebas)] select-none pointer-events-none"
                    style={{ fontSize: "3.5rem", lineHeight: 1, color: "rgba(79,189,186,0.07)" }}
                  >
                    {group.no}
                  </div>

                  <div className="relative">
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.25em]"
                      style={{ color: "#4FBDBA" }}
                    >
                      {group.no}
                    </span>
                    <h3
                      className="mt-1 font-[var(--font-bebas)] text-xl sm:text-2xl tracking-tight leading-tight"
                      style={{ color: "#ffffff" }}
                    >
                      {group.category}
                    </h3>
                    <div
                      className="mt-3 mb-4 h-px w-full"
                      style={{ background: "linear-gradient(to right, rgba(79,189,186,0.45), transparent)" }}
                    />
                    <ul className="space-y-2">
                      {group.params.map((p) => (
                        <li key={p} className="flex items-start gap-2">
                          <span
                            className="mt-[5px] h-1 w-1 shrink-0"
                            style={{ background: "#4FBDBA", transform: "rotate(45deg)" }}
                          />
                          <span
                            className="font-mono text-[10px] leading-relaxed"
                            style={{ color: "rgba(255,255,255,0.78)" }}
                          >
                            {p}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </PageSection>

        {/* ── Vision ── */}
        <PageSection page="landing" variant="principles">
          <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-14 sm:py-20 md:py-24">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-8" style={{ background: "#4FBDBA" }} />
                  <span className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: "#4FBDBA" }}>
                    Vision
                  </span>
                </div>
                <h2
                  className="font-[var(--font-bebas)] text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none"
                  style={{ color: "#1B4965" }}
                >
                  CLINICAL
                  <br />
                  INTELLIGENCE,
                  <br />
                  <span style={{ color: "#2A8F9C" }}>WITHIN REACH</span>
                </h2>
              </div>

              <div className="flex flex-col justify-center gap-6">
                <p className="font-mono text-sm sm:text-[15px] leading-relaxed" style={{ color: "#0c1b24" }}>
                  We envision a future where clinical intelligence is easier to access, understand, and use. Our vision
                  is to make PHASE-XS a trusted intelligence platform for clinical research — delivering actionable
                  insights across newly developed molecules, indications, and therapeutic areas, and putting that
                  information to work in{" "}
                  <span style={{ color: "#2A8F9C", fontWeight: 600 }}>
                    business development, regulatory, medical, and pipeline planning
                  </span>{" "}
                  for pharma, biotech, and life sciences.
                </p>
                <div className="h-px w-24" style={{ background: "linear-gradient(to right, #2A8F9C, transparent)" }} />
                <p className="font-mono text-sm leading-relaxed" style={{ color: "#3d6070" }}>
                  PHASE-XS aims to help teams identify changes in the competitive landscape, evaluate opportunities, and
                  make decisions with more timely information.
                </p>
              </div>
            </div>
          </section>
        </PageSection>

        {/* ── Mission ── */}
        <PageSection page="landing" variant="credibility">
          <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-14 sm:py-20 md:py-24">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8" style={{ background: "#4FBDBA" }} />
              <span className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: "#4FBDBA" }}>
                Mission
              </span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <h2
                className="font-[var(--font-bebas)] text-4xl sm:text-5xl md:text-6xl tracking-tight"
                style={{ color: "#1B4965" }}
              >
                FOUR FOCUS AREAS
              </h2>
              <p className="max-w-md font-mono text-xs leading-relaxed lg:pb-2" style={{ color: "#3d6070" }}>
                Making clinical trial intelligence faster to access, easier to interpret, and genuinely useful for
                pharma, biotech, and life sciences teams.
              </p>
            </div>

            <div className="mt-12 grid gap-px sm:grid-cols-2" style={{ background: "rgba(27,73,101,0.1)" }}>
              {missionPillars.map((pillar) => (
                <article key={pillar.no} className="relative bg-white p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <span
                      className="font-[var(--font-bebas)] text-3xl sm:text-4xl leading-none shrink-0"
                      style={{ color: pillar.accent, opacity: 0.35 }}
                    >
                      {pillar.no}
                    </span>
                    <div>
                      <h3
                        className="font-[var(--font-bebas)] text-2xl sm:text-3xl tracking-tight leading-tight"
                        style={{ color: pillar.accent }}
                      >
                        {pillar.title}
                      </h3>
                      <div
                        className="my-4 h-px w-10"
                        style={{ background: `linear-gradient(to right, ${pillar.accent}, transparent)` }}
                      />
                      <p className="font-mono text-xs leading-relaxed" style={{ color: "#3d6070" }}>
                        {pillar.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </PageSection>

        {/* ── Parent company ── */}
        <PageSection page="landing" variant="clientele">
          <section className="px-4 sm:px-6 lg:px-12 xl:px-20 pt-14 sm:pt-20 pb-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8" style={{ background: "#4FBDBA" }} />
              <span className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: "#4FBDBA" }}>
                Backed By
              </span>
            </div>
            <h2
              className="font-[var(--font-bebas)] text-4xl sm:text-5xl md:text-6xl tracking-tight"
              style={{ color: "#1B4965" }}
            >
              A VENTURE OF CMI
            </h2>
            <p className="mt-5 max-w-3xl font-mono text-sm leading-relaxed" style={{ color: "#3d6070" }}>
              PHASE-XS is a venture of{" "}
              <a
                href="https://www.coherentmarketinsights.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors hover:text-[#1B4965]"
                style={{ color: "#2A8F9C", fontWeight: 600 }}
              >
                Coherent Market Insights ↗
              </a>
              , a data advisory and business consulting firm holding ISO 9001:2015 and ISO 27001:2022 certifications,
              an ESOMAR membership, and D-U-N-S registration 860519526. The platform inherits CMI's research
              infrastructure, certification standards, and global primary-research network.
            </p>
          </section>

          <CredibilitySection />
          <AwardsSection />
        </PageSection>

        <CmiVentureBanner />

        <div className="py-8" />

        <Footer />
      </div>
    </main>
  )
}
