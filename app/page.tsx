import { computeDatasetCoverageStats } from "@/app/dashboard/trial-types"
import { HeroSection } from "@/components/hero-section"
import { SignalsSection } from "@/components/signals-section"
import { loadTrialsForMarketing } from "@/lib/trials-for-marketing"
import { WorkSection } from "@/components/work-section"
import { PrinciplesSection } from "@/components/principles-section"
import { WhyCmiSection } from "@/components/why-cmi-section"
import { CmiVentureBanner } from "@/components/cmi-venture-banner"
import { KeyStatsSection } from "@/components/key-stats-section"
import { CredibilitySection } from "@/components/credibility-section"
import { ClienteleSection } from "@/components/clientele-section"
import { ColophonSection } from "@/components/colophon-section"
import { Footer } from "@/components/footer"
import { SideNav } from "@/components/side-nav"
import { TopNav } from "@/components/top-nav"
import { ContactTab } from "@/components/contact-tab"
import { AnimatedBackground } from "@/components/animated-background"
import { PageSection } from "@/components/page-section"

export default async function Page() {
  const trials = await loadTrialsForMarketing()
  const coverage = computeDatasetCoverageStats(trials)

  return (
    <main className="relative min-h-screen">
      <TopNav />
      <SideNav />
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
        <HeroSection trialCount={coverage.trials} moleculeCount={coverage.molecules} />
        <PageSection page="landing" variant="metrics">
          <SignalsSection coverage={coverage} />
        </PageSection>
        <PageSection page="landing" variant="coverage">
          <WorkSection />
        </PageSection>
        <PageSection page="landing" variant="principles">
          <PrinciplesSection />
        </PageSection>
        <CmiVentureBanner />
        <PageSection page="landing" variant="clientele">
          <ClienteleSection />
        </PageSection>
        <PageSection page="landing" variant="credibility">
          <CredibilitySection />
        </PageSection>
        <PageSection page="landing" variant="platform">
          <WhyCmiSection />
        </PageSection>
        <PageSection page="landing" variant="keystats">
          <KeyStatsSection />
        </PageSection>
        <ColophonSection />
        <Footer />
      </div>
    </main>
  )
}
