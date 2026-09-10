"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function ColophonSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          x: -60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }

      if (gridRef.current) {
        const columns = gridRef.current.querySelectorAll(":scope > div")
        gsap.from(columns, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }

      if (footerRef.current) {
        gsap.from(footerRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const columnColors = ["#1B4965", "#1E6080", "#2A8F9C", "#3AAFA9"]

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-12 px-4 sm:px-6 lg:px-12 xl:px-20"
      style={{ borderTop: "1px solid rgba(192, 212, 220, 0.3)" }}
    >
      {/* Bottom copyright — gradient divider c1 → c5 */}
      <div
        ref={footerRef}
        className="pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        style={{ borderTop: "1px solid rgba(192, 212, 220, 0.2)" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#1E6080" }}>
          © 2026 PHASE-XS. AI Powered Clinical Intelligence Platform.
        </p>
        <p className="font-mono text-[10px]" style={{ color: "#3AAFA9" }}>
          Data-driven insights. Built with precision.
        </p>
      </div>
    </section>
  )
}

