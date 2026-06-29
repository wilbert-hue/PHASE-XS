import { computeDatasetCoverageStats } from "@/app/dashboard/trial-types"
import { HeroSection } from "@/components/hero-section"
import { SignalsSection } from "@/components/signals-section"
import { loadTrialsForMarketing } from "@/lib/trials-for-marketing"
import { WorkSection } from "@/components/work-section"
import { PrinciplesSection } from "@/components/principles-section"
import { WhyCmiSection } from "@/components/why-cmi-section"
import { KeyStatsSection } from "@/components/key-stats-section"
import { CredibilitySection } from "@/components/credibility-section"
import { ClienteleSection } from "@/components/clientele-section"
import { ColophonSection } from "@/components/colophon-section"
import { Footer } from "@/components/footer"
import { SideNav } from "@/components/side-nav"
import { ContactTab } from "@/components/contact-tab"
import { AnimatedBackground } from "@/components/animated-background"
import { PageSection } from "@/components/page-section"

export default async function Page() {
  const trials = await loadTrialsForMarketing()
  const coverage = computeDatasetCoverageStats(trials)

  return (
    <main className="relative min-h-screen">
      <SideNav />
      <ContactTab />
      <AnimatedBackground />

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
        <PageSection page="landing" variant="credibility">
          <CredibilitySection />
        </PageSection>
        <PageSection page="landing" variant="clientele">
          <ClienteleSection />
        </PageSection>
        <PageSection page="landing" variant="platform">
          <WhyCmiSection />
        </PageSection>
        <PageSection page="landing" variant="keystats">
          <KeyStatsSection />
        </PageSection>
        <PageSection page="landing" variant="colophon">
          <ColophonSection />
        </PageSection>
        <Footer />
      </div>
    </main>
  )
}
