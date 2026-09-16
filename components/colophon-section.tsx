"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function ColophonSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !footerRef.current) return

    const ctx = gsap.context(() => {
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
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-12 px-4 sm:px-6 lg:px-12 xl:px-20"
      style={{ borderTop: "1px solid rgba(192, 212, 220, 0.3)" }}
    >
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
