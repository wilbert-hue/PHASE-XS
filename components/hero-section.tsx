"use client"

import { useEffect, useRef } from "react"
import { AUTH0_LOGIN_HREF, AUTH0_SIGNUP_HREF } from "@/lib/auth0-routes"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { SplitFlapPhaseXsNctBack, SplitFlapMuteToggle, SplitFlapAudioProvider } from "@/components/split-flap-text"
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
    <section ref={sectionRef} id="hero" className="relative min-h-screen flex items-center pl-6 md:pl-28 pr-6 md:pr-12 overflow-hidden">
      <AnimatedNoise opacity={0.03} />

      {/* Gradient glow — uses c1, c3, c5 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 15% 50%, rgba(27, 73, 101, 0.10) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 75% 25%, rgba(42, 143, 156, 0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 85%, rgba(79, 189, 186, 0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* Left vertical label — c4 */}
      <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.3em] -rotate-90 origin-left block whitespace-nowrap"
          style={{ color: "#3AAFA9" }}
        >
          SIGNAL
        </span>
      </div>

      {/* Left accent line — c1 → c3 → c5 full gradient */}
      <div
        className="absolute left-0 top-[15%] w-[2px] h-[40%] opacity-40"
        style={{
          background: "linear-gradient(to bottom, transparent, #1B4965, #2A8F9C, #4FBDBA, transparent)",
        }}
      />

      {/* Main content */}
      <div ref={contentRef} className="flex-1 w-full relative z-10">
        <SplitFlapAudioProvider>
          <div className="relative">
            <SplitFlapPhaseXsNctBack speed={80} />
            <div className="mt-4">
              <SplitFlapMuteToggle />
            </div>
          </div>
        </SplitFlapAudioProvider>

        {/* Subtitle — c2 */}
        <h2
          className="font-[var(--font-bebas)] text-[clamp(1rem,3vw,2rem)] mt-4 tracking-wide"
          style={{ color: "#1E6080" }}
        >
          Secure trials intelligence
        </h2>

        <p className="mt-12 max-w-md font-mono text-sm leading-relaxed" style={{ color: "#3d6070" }}>
          <span style={{ color: "#3AAFA9", fontWeight: 600 }}>{moleculeCount.toLocaleString()} molecules.</span>{" "}
          Access the dashboard with Auth0—Universal Login, SSO, and social connections. Built for teams that need audited access and optional billing-ready flows.
        </p>

        <div className="mt-16 flex flex-wrap items-center gap-6 md:gap-8">
          <a
            href={AUTH0_LOGIN_HREF}
            className="group inline-flex items-center gap-3 px-6 py-3 font-mono text-xs uppercase tracking-widest text-white transition-all duration-300 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #1B4965, #1E6080)",
              border: "1px solid rgba(42, 143, 156, 0.3)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #1E6080, #2A8F9C)"
              e.currentTarget.style.borderColor = "rgba(58, 175, 169, 0.5)"
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #1B4965, #1E6080)"
              e.currentTarget.style.borderColor = "rgba(42, 143, 156, 0.3)"
            }}
          >
            <ScrambleTextOnHover text="Sign in to dashboard" as="span" duration={0.6} />
            <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
          </a>
          <a
            href={AUTH0_SIGNUP_HREF}
            className="font-mono text-xs uppercase tracking-widest transition-colors duration-200 border border-[rgba(42,143,156,0.35)] px-4 py-2.5 rounded"
            style={{ color: "#1B4965" }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#2A8F9C"
              e.currentTarget.style.borderColor = "rgba(58, 175, 169, 0.6)"
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#1B4965"
              e.currentTarget.style.borderColor = "rgba(42, 143, 156, 0.35)"
            }}
          >
            Create account
          </a>
          <a
            href="#metrics"
            className="font-mono text-xs uppercase tracking-widest transition-colors duration-200"
            style={{ color: "#3AAFA9" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#1B4965")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#3AAFA9")}
          >
            Key metrics
          </a>
        </div>
      </div>

      {/* Floating info tag — c3 border, c2 text, c1 bg tint */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-10">
        <div
          className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest"
          style={{
            border: "1px solid rgba(42, 143, 156, 0.3)",
            color: "#1E6080",
            background: "rgba(27, 73, 101, 0.04)",
          }}
        >
          v.01 / {trialCount.toLocaleString()} US Biologics Trials
        </div>
      </div>
    </section>
  )
}
