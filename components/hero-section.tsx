"use client"

import { useEffect, useRef } from "react"
import { AUTH0_LOGIN_HREF } from "@/lib/auth0-routes"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { SplitFlapPhaseXsNctBack, SplitFlapAudioProvider } from "@/components/split-flap-text"
import { AnimatedNoise } from "@/components/animated-noise"
import { BitmapChevron } from "@/components/bitmap-chevron"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function HeroSection({
  trialCount,
  moleculeCount,
}: {
  trialCount: number
  moleculeCount: number
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        y: -100,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="hero" className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-12 xl:px-20 overflow-hidden pt-12 sm:pt-14 lg:pt-16">
      <AnimatedNoise opacity={0.03} />

      {/* White vignette over the dotted bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 80% at 25% 50%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.5) 55%, transparent 80%)",
        }}
      />

      {/* Main content */}
      <div ref={contentRef} className="flex-1 w-full relative z-10">
        <SplitFlapAudioProvider>
          <div className="relative">
            <SplitFlapPhaseXsNctBack speed={80} />
          </div>
        </SplitFlapAudioProvider>

        {/* Subtitle — c2 */}
        <h2
          className="font-[var(--font-bebas)] text-[clamp(1rem,3vw,2rem)] mt-4 tracking-wide"
          style={{ color: "#1E6080" }}
        >
          AI powered clinical intelligence platform
        </h2>

        <p className="mt-12 max-w-md font-mono text-sm leading-relaxed" style={{ color: "#0c1b24" }}>
          <span style={{ color: "#2A8F9C", fontWeight: 600 }}>{moleculeCount.toLocaleString()}+ molecules</span>{" "}
          across {trialCount.toLocaleString()}+ trials in 17 countries. The intelligence platform for pharma teams that need to move faster than the market.
        </p>

        <div className="mt-16 flex flex-wrap items-center gap-6 md:gap-8">
          <a
            href={AUTH0_LOGIN_HREF}
            className="group inline-flex items-center gap-3 px-6 py-3 font-mono text-xs uppercase tracking-widest text-white transition-all duration-300 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #1B4965, #1E6080)",
              border: "1px solid rgba(42, 143, 156, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #1E6080, #2A8F9C)"
              e.currentTarget.style.borderColor = "rgba(58, 175, 169, 0.5)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #1B4965, #1E6080)"
              e.currentTarget.style.borderColor = "rgba(42, 143, 156, 0.3)"
            }}
          >
            <ScrambleTextOnHover text="Sign in to dashboard" as="span" duration={0.6} />
            <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
          </a>
          <a
            href="#metrics"
            className="font-mono text-xs uppercase tracking-widest transition-colors duration-200"
            style={{ color: "#3AAFA9" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#1B4965")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3AAFA9")}
          >
            Key metrics
          </a>
        </div>
      </div>

    </section>
  )
}
