"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AUTH0_LOGIN_HREF } from "@/lib/auth0-routes"

const navItems = [
  { id: "hero",     label: "Home" },
  { id: "metrics",  label: "Metrics" },
  { id: "coverage", label: "Coverage" },
  { id: "platform", label: "Platform" },
  { id: "about",    label: "About" },
]

export function TopNav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState("hero")
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) })
      },
      { threshold: 0.3 },
    )
    navItems.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    } else {
      // Not on home page — navigate there with the anchor
      window.location.href = `/#${id}`
    }
    setMenuOpen(false)
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(240,245,247,0.92)" : "rgba(240,245,247,0.7)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid rgba(42,143,156,0.18)" : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 16px rgba(27,73,101,0.06)" : "none",
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 h-12 sm:h-14 lg:h-16 flex items-center justify-between">

        {/* Logo */}
        <button onClick={() => scrollTo("hero")} className="flex items-center gap-1.5 shrink-0 group">
          <svg
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7"
          >
            <circle cx="22" cy="22" r="19" stroke="#2A8F9C" strokeWidth="1.3" strokeDasharray="3 2.5"/>
            <circle cx="22" cy="22" r="11" stroke="#2A8F9C" strokeWidth="1" opacity="0.4"/>
            <line x1="22" y1="2"  x2="22" y2="9"  stroke="#2A8F9C" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="22" y1="35" x2="22" y2="42" stroke="#2A8F9C" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="2"  y1="22" x2="9"  y2="22" stroke="#2A8F9C" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="35" y1="22" x2="42" y2="22" stroke="#2A8F9C" strokeWidth="1.6" strokeLinecap="round"/>
            <circle cx="22" cy="22" r="2.5" fill="#2A8F9C"/>
          </svg>
          <div className="flex flex-col items-start leading-none">
            <span
              className="font-[var(--font-bebas)] tracking-[0.1em] whitespace-nowrap text-base sm:text-lg lg:text-xl xl:text-2xl"
              style={{ color: "#1B4965" }}
            >
              PHASE-XS
            </span>
            <span
              className="font-mono tracking-[0.22em] uppercase whitespace-nowrap text-[7px] sm:text-[8px] lg:text-[9px]"
              style={{ color: "#2A8F9C" }}
            >
              Clinical Intelligence
            </span>
          </div>
        </button>

        {/* Desktop nav links — hidden on small/medium, visible from lg */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
          {navItems.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="font-mono text-xs xl:text-[13px] uppercase tracking-widest transition-colors duration-200"
              style={{ color: active === id ? "#1B4965" : "#3d6070" }}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4">
          <Link
            href={AUTH0_LOGIN_HREF}
            className="font-mono text-xs xl:text-[13px] uppercase tracking-widest transition-colors duration-200"
            style={{ color: "#3d6070" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#1B4965")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#3d6070")}
          >
            Sign In
          </Link>
          <Link
            href="/contact"
            className="font-mono text-xs xl:text-[13px] uppercase tracking-widest px-3 xl:px-4 py-2 text-white transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #1B4965, #2A8F9C)",
              border: "1px solid rgba(42,143,156,0.3)",
            }}
            onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #2A8F9C, #3AAFA9)" }}
            onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #1B4965, #2A8F9C)" }}
          >
            Get Access
          </Link>
        </div>

        {/* Hamburger — shown below lg */}
        <button
          className="lg:hidden flex flex-col gap-[5px] p-1"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-px transition-all duration-200" style={{ background: "#1B4965", transform: menuOpen ? "rotate(45deg) translate(2px,2px)" : "none" }} />
          <span className="block w-5 h-px transition-all duration-200" style={{ background: "#1B4965", opacity: menuOpen ? 0 : 1 }} />
          <span className="block w-5 h-px transition-all duration-200" style={{ background: "#1B4965", transform: menuOpen ? "rotate(-45deg) translate(2px,-2px)" : "none" }} />
        </button>
      </div>

      {/* Mobile/tablet menu */}
      {menuOpen && (
        <div
          className="lg:hidden px-4 sm:px-6 pb-5 pt-2 flex flex-col gap-4"
          style={{ borderTop: "1px solid rgba(42,143,156,0.15)", background: "rgba(240,245,247,0.97)" }}
        >
          {navItems.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-left font-mono text-[12px] uppercase tracking-widest py-1"
              style={{ color: active === id ? "#1B4965" : "#3d6070" }}
            >
              {label}
            </button>
          ))}
          <div className="flex gap-4 pt-2" style={{ borderTop: "1px solid rgba(42,143,156,0.12)" }}>
            <Link href={AUTH0_LOGIN_HREF} className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "#3d6070" }}>
              Sign In
            </Link>
            <Link href="/contact" className="font-mono text-[11px] uppercase tracking-widest px-4 py-1.5 text-white" style={{ background: "linear-gradient(135deg,#1B4965,#2A8F9C)" }}>
              Get Access
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
